"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@/features/shell/components/icons";

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200";
const labelClass = "text-sm font-bold text-brand-900";

export default function NabungSampahPage() {
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
          Nabung Sampah
        </h1>
        <p className="text-sm text-muted-foreground">
          Setorkan sampahmu dan ubah menjadi nilai.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="space-y-2">
            <label htmlFor="nama" className={labelClass}>
              Nama
            </label>
            <input id="nama" type="text" className={inputClass} placeholder="Nama Anda" />
          </div>

          <div className="space-y-2">
            <label htmlFor="jenis" className={labelClass}>
              Jenis Sampah
            </label>
            <select id="jenis" className={inputClass} disabled>
              <option>Pilih jenis sampah</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="berat" className={labelClass}>
              Berat Sampah (Kg)
            </label>
            <input
              id="berat"
              type="number"
              min="0"
              step="0.1"
              className={inputClass}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tanggal" className={labelClass}>
              Tanggal Setor
            </label>
            <input id="tanggal" type="date" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled
            className="w-full rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-bold text-white opacity-60"
            title="Segera hadir"
          >
            Konfirmasi Setoran
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Fitur setoran akan aktif pada tahap berikutnya.
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Estimasi Nilai Sampah
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pilih jenis sampah
          </p>
          <p className="mt-1 font-serif text-4xl text-brand-700">Rp 0</p>
          <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
            0 Kg × Rp 0 = Rp 0
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Nilai akan masuk ke saldo setelah setoran selesai diverifikasi.
          </p>
        </aside>
      </div>
    </div>
  );
}
