"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { SiteFooter } from "./site-footer";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((session) => {
        if (cancelled) return;
        if (!session) {
          router.replace("/login");
          return;
        }
        if (session.role !== "nasabah") {
          router.replace("/admin");
          return;
        }
        setUser(session);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!user) {
    return (
      <div
        className="grid min-h-screen place-items-center text-sm text-muted-foreground"
        role="status"
      >
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
          <AppHeader user={user} onMenuClick={() => setMenuOpen(true)} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
