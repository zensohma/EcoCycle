"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, LeafIcon } from "@/features/shell/components/icons";

const FILTERS = ["Semua", "Uang Masuk", "Penarikan", "Menunggu"] as const;

export default function TransaksiPage() {
  const [active, setActive] = useState<string>("Semua");

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali
      </Link>

      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-brand-900 sm:text-4xl">
          Riwayat Transaksi
        </h1>
        <p className="text-sm text-muted-foreground">
          Pantau nilai yang Anda ciptakan untuk lingkungan.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === filter
                ? "bg-brand-700 text-white"
                : "bg-brand-100 text-brand-800 hover:bg-brand-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
          <LeafIcon />
        </span>
        <p className="mt-4 font-bold text-foreground">
          Belum ada transaksi.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Yuk mulai menabung sampah bersama EcoCycle.
        </p>
        <Link
          href="/dashboard/nabung"
          className="mt-5 inline-block rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-800"
        >
          Mulai Nabung Sampah
        </Link>
      </div>
    </div>
  );
}
