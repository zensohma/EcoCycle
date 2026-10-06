"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { LogOutIcon } from "@/features/shell/components/icons";
import { getCurrentUser, logoutUser } from "@/lib/api";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      router.push("/login");
    }
  }

  const initial = user?.name.trim().charAt(0).toUpperCase() || "?";
  const roleLabel =
    user?.role === "administrator" ? "Administrator" : "Pengelola";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Profil Admin"
        subtitle="Kelola akun administrator."
      />

      <div className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {initial}
          </span>
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">
              {user?.name ?? "Memuat..."}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          <LogOutIcon className="h-4 w-4" />
          {loggingOut ? "Logout..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
