"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/features/shell/components/icons";
import { getWasteBank, mapsLink, type PublicWasteBank } from "../api";

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <dt className="text-xs font-bold uppercase tracking-wide text-brand-600">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export function BankDetail({ id }: { id: string }) {
  const [bank, setBank] = useState<PublicWasteBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWasteBank(id)
      .then((data) => {
        setBank(data);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Memuat detail bank sampah...
      </p>
    );
  }

  if (error || !bank) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600" role="alert">
          {error ?? "Bank sampah tidak ditemukan"}
        </p>
        <Link
          href="/waste-banks"
          className="text-sm font-semibold text-brand-700 underline underline-offset-4"
        >
          Kembali ke daftar bank sampah
        </Link>
      </div>
    );
  }

  return (
    <section className="w-full space-y-6">
      <Link
        href="/waste-banks"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali
      </Link>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
          {bank.region}
        </p>
        <h1 className="font-serif text-3xl text-brand-900 sm:text-4xl">
          {bank.name}
        </h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <dl className="space-y-4">
          <InfoRow label="Alamat" value={bank.address} />
          <InfoRow label="Telepon" value={bank.phone} />
          <InfoRow label="Email" value={bank.email} />
          <InfoRow label="Jadwal operasional" value={bank.operating_hours} />
          <InfoRow label="Prosedur penyetoran" value={bank.deposit_procedure} />
        </dl>
      </div>

      <a
        href={mapsLink(bank)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800 sm:w-auto"
      >
        Buka di Google Maps
      </a>
    </section>
  );
}
