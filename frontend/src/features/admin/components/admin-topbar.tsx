"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellIcon,
  MenuIcon,
  RefreshIcon,
} from "@/features/shell/components/icons";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function AdminTopbar({
  user,
  onMenuClick,
}: {
  user: SessionUser;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const roleLabel = user.role === "administrator" ? "Administrator" : "Pengelola";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-border bg-card p-2 text-foreground lg:hidden"
          aria-label="Buka menu"
        >
          <MenuIcon />
        </button>
        <div>
          <p className="text-lg font-bold leading-tight text-foreground">
            EcoCycle Admin
          </p>
          <p className="text-xs text-muted-foreground">
            Dari Sampah Jadi Berharga
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-lg border border-border bg-card p-2 text-foreground transition-colors hover:border-brand-200 hover:text-brand-700"
          aria-label="Muat ulang data"
        >
          <RefreshIcon />
        </button>
        <Link
          href="/admin/notifikasi"
          className="rounded-lg border border-border bg-card p-2 text-foreground transition-colors hover:border-brand-200 hover:text-brand-700"
          aria-label="Notifikasi"
        >
          <BellIcon />
        </Link>
        <Link
          href="/admin/profil"
          className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-brand-50"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 font-bold text-brand-700">
            {initial}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-40 truncate text-sm font-bold leading-tight text-foreground">
              {user.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {roleLabel}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
