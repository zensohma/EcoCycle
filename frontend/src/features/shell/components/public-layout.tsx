import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/features/shell/components/logo";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <span className="text-lg font-semibold">EcoCycle</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/waste-banks" className="underline underline-offset-4">
            Bank Sampah
          </Link>
          <Link href="/register" className="underline underline-offset-4">
            Daftar
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-brand-700 px-4 py-2 text-white transition-colors hover:bg-brand-800"
          >
            Masuk
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm">
          <p className="font-semibold text-brand-700">EcoCycle · BANK SAMPAH</p>
          <p className="mt-1 text-muted-foreground">
            Pilih sampah hari ini, ciptakan nilai untuk hari esok.
          </p>
          <p className="mt-3 text-muted-foreground">
            © 2026 EcoCycle Bank Sampah.
          </p>
        </div>
      </footer>
    </div>
  );
}
