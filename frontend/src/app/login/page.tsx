import Link from "next/link";
import { ArrowLeftIcon } from "@/features/shell/components/icons";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-white via-brand-50 to-brand-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-lg sm:p-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali
        </Link>
        <h1 className="mb-6 font-serif text-3xl text-brand-900">Masuk</h1>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-700 underline underline-offset-4"
          >
            Buat Akun
          </Link>
        </p>
      </div>
    </div>
  );
}
