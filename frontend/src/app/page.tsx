import Link from "next/link";
import { Logo } from "@/features/shell/components/logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-white via-brand-50 to-brand-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-lg sm:p-10">
        <div className="flex flex-col items-center gap-5">
          <Logo className="h-24 w-24" />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
            EcoCycle · Bank Sampah
          </p>
          <h1 className="font-serif text-3xl leading-tight text-brand-900 sm:text-4xl">
            Selamat Datang di EcoCycle
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Kelola sampahmu, dapatkan nilai dari setiap setoran.
          </p>
          <div className="flex w-full flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="w-full rounded-xl bg-brand-100 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-800 transition-colors hover:bg-brand-200"
            >
              Buat Akun
            </Link>
          </div>
        </div>
      </div>
      <Link
        href="/waste-banks"
        className="mt-6 text-sm font-medium text-brand-700 underline underline-offset-4 hover:text-brand-900"
      >
        Lihat daftar bank sampah mitra →
      </Link>
    </div>
  );
}
