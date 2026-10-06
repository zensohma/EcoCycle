import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRightIcon,
  ClipboardIcon,
  ListIcon,
  RecycleIcon,
  ScaleIcon,
  TruckIcon,
  WalletIcon,
} from "@/features/shell/components/icons";

function QuickAction({
  href,
  label,
  icon,
  disabled = false,
}: {
  href?: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={`flex h-full flex-col gap-6 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:border-brand-600"
      }`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </span>
      <span className="text-sm font-bold text-foreground">{label}</span>
    </div>
  );

  if (disabled) return <div aria-disabled>{content}</div>;
  return <Link href={href ?? "#"}>{content}</Link>;
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <h1 className="max-w-3xl font-serif text-3xl leading-tight text-brand-900 sm:text-4xl">
        Ubah sampah menjadi nilai bersama EcoCycle.
      </h1>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-brand-800 p-6 text-white lg:col-span-2">
          <div
            className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/5"
            aria-hidden
          />
          <div
            className="absolute -right-4 top-14 h-40 w-40 rounded-full bg-white/5"
            aria-hidden
          />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            Saldo Saya
          </p>
          <p className="mt-2 font-serif text-4xl sm:text-5xl">Rp 0</p>
          <Link
            href="/dashboard/profil"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/25"
          >
            Lihat Saldo Saya
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <ScaleIcon />
          </span>
          <p className="mt-4 font-serif text-3xl text-brand-900">0 Kg</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total Sampah Terkumpul
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-brand-900">Aksi Cepat</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/dashboard/nabung"
            label="Nabung Sampah"
            icon={<RecycleIcon />}
          />
          <QuickAction
            href="/dashboard/jemput"
            label="Jemput Sampah"
            icon={<TruckIcon />}
          />
          <QuickAction
            label="Tarik Saldo"
            icon={<WalletIcon />}
            disabled
          />
          <QuickAction
            href="/dashboard/transaksi"
            label="Riwayat Transaksi"
            icon={<ClipboardIcon />}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Sederhana, Transparan, Berdampak
            </p>
            <h2 className="font-serif text-2xl text-brand-900">
              Cara Kerja EcoCycle
            </h2>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-brand-100 px-4 py-2.5 text-sm font-semibold text-brand-800 opacity-70"
            title="Segera hadir"
          >
            <ListIcon className="h-4 w-4" />
            Jenis Sampah
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            ["01", "Pilah Sampah"],
            ["02", "Setorkan Sampah"],
            ["03", "Sampah Ditimbang"],
            ["04", "Saldo Bertambah"],
          ].map(([step, label]) => (
            <div key={step} className="space-y-2">
              <p className="font-serif text-2xl text-brand-600">{step}</p>
              <p className="text-sm font-bold text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-100 p-6">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl text-brand-900">
            Dari Sampah Jadi Berharga
          </h2>
          <p className="text-sm text-muted-foreground">
            Setiap sampah yang kamu pilah bisa menjadi nilai.
          </p>
        </div>
        <Link
          href="/dashboard/nabung"
          className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-800"
        >
          Mulai Nabung Sampah
        </Link>
      </section>
    </div>
  );
}
