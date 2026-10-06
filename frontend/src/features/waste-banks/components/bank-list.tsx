"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWasteBanks, type PublicWasteBank } from "../api";

export function BankList() {
  const [query, setQuery] = useState("");
  const [banks, setBanks] = useState<PublicWasteBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      getWasteBanks(query)
        .then((data) => {
          setBanks(data);
          setError(null);
        })
        .catch((err: unknown) => {
          if (!controller.signal.aborted) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <section className="w-full space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
          EcoCycle · Bank Sampah
        </p>
        <h1 className="font-serif text-3xl text-brand-900 sm:text-4xl">
          Bank Sampah Mitra
        </h1>
        <p className="text-sm text-muted-foreground">
          Temukan bank sampah terdekat, cari berdasarkan nama atau wilayah
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="bank-search" className="sr-only">
          Cari bank sampah
        </label>
        <input
          id="bank-search"
          type="search"
          className="w-full rounded-full border border-border bg-card px-5 py-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder="Cari nama atau wilayah..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Memuat bank sampah...
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && banks.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Tidak ada bank sampah yang cocok dengan pencarian Anda.
          </p>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-sm font-semibold text-brand-700 underline underline-offset-4"
            >
              Hapus pencarian
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && banks.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banks.map((bank) => (
            <li key={bank.id}>
              <Link
                href={`/waste-banks/${bank.id}`}
                className="flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-brand-600"
              >
                <span className="font-serif text-lg text-brand-900">
                  {bank.name}
                </span>
                <span className="text-sm font-semibold text-brand-600">
                  {bank.region}
                </span>
                <span className="text-sm text-muted-foreground">
                  {bank.address}
                </span>
                <span className="mt-auto pt-2 text-sm font-semibold text-brand-700 underline underline-offset-4">
                  Lihat detail
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
