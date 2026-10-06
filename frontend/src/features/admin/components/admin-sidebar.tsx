"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BellIcon,
  ClipboardIcon,
  GridIcon,
  LogOutIcon,
  ScaleIcon,
  SettingsIcon,
  TagIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
} from "@/features/shell/components/icons";
import { Logo } from "@/features/shell/components/logo";
import { logoutUser } from "@/lib/api";

type MenuIcon = (props: { className?: string }) => ReactElement;

const MENU: { href: string; label: string; icon: MenuIcon; exact?: boolean }[] =
  [
    { href: "/admin", label: "Dashboard", icon: GridIcon, exact: true },
    { href: "/admin/setoran", label: "Setoran Sampah", icon: ScaleIcon },
    { href: "/admin/jemput", label: "Jemput Sampah", icon: TruckIcon },
    { href: "/admin/pelanggan", label: "Pelanggan", icon: UsersIcon },
    { href: "/admin/penarikan", label: "Penarikan Saldo", icon: WalletIcon },
    { href: "/admin/transaksi", label: "Transaksi", icon: ClipboardIcon },
    { href: "/admin/harga", label: "Harga Sampah", icon: TagIcon },
    { href: "/admin/notifikasi", label: "Notifikasi", icon: BellIcon },
    { href: "/admin/pengaturan", label: "Pengaturan", icon: SettingsIcon },
    { href: "/admin/profil", label: "Profil Admin", icon: UserIcon },
  ];

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();
    } finally {
      router.push("/login");
    }
  }

  return (
    <nav className="flex flex-col gap-1 px-3">
      {MENU.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-brand-700 text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="mt-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOutIcon className="h-5 w-5 shrink-0" />
        Logout
      </button>
    </nav>
  );
}

function Brand({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between px-5">
      <div className="flex items-center gap-3">
        <Logo className="h-11 w-11" tone="dark" />
        <div>
          <p className="text-base font-bold leading-tight text-white">
            EcoCycle Admin
          </p>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-white/60">
            BANK SAMPAH
          </p>
        </div>
      </div>
      {onClose ? (
        <button
          type="button"
          className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup menu"
          onClick={onClose}
        >
          <XIcon />
        </button>
      ) : null}
    </div>
  );
}

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 bg-brand-800 py-6 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavItems pathname={pathname} />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col gap-8 bg-brand-800 py-6">
            <Brand onClose={onClose} />
            <div className="flex-1 overflow-y-auto">
              <NavItems pathname={pathname} onNavigate={onClose} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
