"use client";

import Link from "next/link";
import { ArrowLeftIcon, TruckIcon } from "@/features/shell/components/icons";

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200";
const labelClass = "text-sm font-bold text-brand-900";

export default function JemputSampahPage() {
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
          Jemput Sampah
        </h1>
        <p className="text-sm text-muted-foreground">
          Tidak sempat datang? EcoCycle siap menjemput sampahmu.
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
            <label htmlFor="hp" className={labelClass}>
              Nomor HP
            </label>
            <input
              id="hp"
              type="tel"
              className={inputClass}
              placeholder="081234567890"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="alamat" className={labelClass}>
              Alamat Lengkap
            </label>
            <textarea
              id="alamat"
              rows={3}
              className={inputClass}
              placeholder="Alamat penjemputan"
            />
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
              Perkiraan Berat (Kg)
            </label>
            <input
              id="berat"
              type="number"
              min="0"
              className={inputClass}
              placeholder="0"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="tanggal" className={labelClass}>
                Tanggal Penjemputan
              </label>
              <input id="tanggal" type="date" className={inputClass} />
            </div>
            <div className="space-y-2">
              <label htmlFor="jam" className={labelClass}>
                Jam Penjemputan
              </label>
              <input id="jam" type="time" className={inputClass} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="catatan" className={labelClass}>
              Catatan
            </label>
            <textarea
              id="catatan"
              rows={3}
              className={inputClass}
              placeholder="Catatan untuk petugas (opsional)"
            />
          </div>

          <button
            type="submit"
            disabled
            className="w-full rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-bold text-white opacity-60"
            title="Segera hadir"
          >
            Pesan Penjemputan
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Fitur penjemputan akan aktif pada tahap berikutnya.
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <TruckIcon />
          </span>
          <h2 className="mt-4 font-serif text-xl text-brand-900">
            Permintaan Penjemputan
          </h2>
          <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm font-bold text-foreground">
              Belum ada penjemputan
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pesan layanan jemput saat Anda siap.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
