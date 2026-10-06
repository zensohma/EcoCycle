"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardIcon,
  HomeIcon,
  RecycleIcon,
  TruckIcon,
  UserIcon,
  XIcon,
} from "./icons";
import { Logo } from "./logo";

type MenuIcon = (props: { className?: string }) => ReactElement;

const MENU: { href: string; label: string; icon: MenuIcon; exact?: boolean }[] = [
  { href: "/dashboard", label: "Beranda", icon: HomeIcon, exact: true },
  { href: "/dashboard/nabung", label: "Nabung Sampah", icon: RecycleIcon },
  { href: "/dashboard/jemput", label: "Jemput Sampah", icon: TruckIcon },
  { href: "/dashboard/transaksi", label: "Transaksi", icon: ClipboardIcon },
  { href: "/dashboard/profil", label: "Profil", icon: UserIcon },
];

function NavItems({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
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
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              active
                ? "border border-brand-200 bg-brand-700 text-white"
                : "border border-transparent text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between px-5">
      <Logo className="h-14 w-14" tone="dark" />
      <button
        type="button"
        className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
        aria-label="Tutup menu"
        onClick={onClose}
      >
        <XIcon />
      </button>
    </div>
  );
}

function Tagline() {
  return (
    <p className="px-5 text-sm italic text-white/80">
      Dari Sampah Jadi Berharga
    </p>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between bg-brand-800 py-6 lg:flex">
        <div className="space-y-8">
          <div className="px-5">
            <Logo className="h-14 w-14" tone="dark" />
          </div>
          <NavItems pathname={pathname} />
        </div>
        <Tagline />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col justify-between bg-brand-800 py-6">
            <div className="space-y-8">
              <SidebarBrand onClose={onClose} />
              <NavItems pathname={pathname} onNavigate={onClose} />
            </div>
            <Tagline />
          </div>
        </div>
      ) : null}
    </>
  );
}
