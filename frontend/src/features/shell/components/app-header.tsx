"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api";
import { ChevronDownIcon, LogOutIcon, MenuIcon, UserIcon } from "./icons";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      router.push("/login");
    }
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 text-sm font-medium shadow-sm transition-colors hover:border-brand-200"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
          {initial}
        </span>
        <span className="max-w-32 truncate">{user.name}</span>
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <Link
            href="/dashboard/profil"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-brand-50"
          >
            <UserIcon className="h-4 w-4" />
            Profil
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOutIcon className="h-4 w-4" />
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AppHeader({
  user,
  onMenuClick,
}: {
  user: SessionUser;
  onMenuClick: () => void;
}) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-border bg-card p-2 text-foreground lg:hidden"
          aria-label="Buka menu"
        >
          <MenuIcon />
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          EcoCycle / Bank Sampah
        </p>
      </div>
      <UserMenu user={user} />
    </header>
  );
}
