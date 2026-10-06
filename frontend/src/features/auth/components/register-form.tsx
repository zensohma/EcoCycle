"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);

    const name = (formData.get("name") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;
    const confirm_password = formData.get("confirm_password") as string;

    if (!name || !phone || !email || !password || !confirm_password) {
      setError("Semua kolom wajib diisi");
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter");
      return;
    }

    if (password !== confirm_password) {
      setError("Konfirmasi kata sandi tidak sama dengan kata sandi");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, phone, password, confirm_password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mendaftar");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200";
  const labelClass = "text-sm font-bold text-brand-900";

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className={labelClass}>
          Nama Lengkap
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={inputClass}
          placeholder="Nama lengkap"
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className={labelClass}>
          Nomor HP
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={inputClass}
          placeholder="081234567890"
          autoComplete="tel"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={inputClass}
          placeholder="nama@email.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className={inputClass}
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm_password" className={labelClass}>
          Konfirmasi Password
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          className={inputClass}
          placeholder="Ulangi password"
          autoComplete="new-password"
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="text-sm text-green-700" role="status">
          Pendaftaran berhasil. Mengarahkan ke halaman masuk...
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Membuat..." : "Buat Akun"}
      </button>
    </form>
  );
}
