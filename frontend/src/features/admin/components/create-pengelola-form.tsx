"use client";

import { useEffect, useState } from "react";
import { createPengelola, listWasteBanks } from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  waste_bank_id: "",
};

export function CreatePengelolaForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [banks, setBanks] = useState<
    { id: string; name: string; region: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    listWasteBanks()
      .then(setBanks)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Gagal memuat bank sampah");
      });
  }, []);

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Semua kolom wajib diisi");
      return;
    }
    if (form.password.length < 8) {
      setError("Kata sandi minimal 8 karakter");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Konfirmasi kata sandi tidak sama dengan kata sandi");
      return;
    }
    if (!form.waste_bank_id) {
      setError("Pilih bank sampah yang dikelola");
      return;
    }

    setLoading(true);
    try {
      const created = await createPengelola(form);
      setSuccess(`Akun pengelola "${created.name}" berhasil dibuat`);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun pengelola");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-black/[.15] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 dark:border-white/[.25]";

  return (
    <div className="space-y-4 rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.08] dark:bg-black/60">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Buat Akun Pengelola</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pengelola akan ditetapkan ke satu bank sampah
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="pengelola-name" className="text-sm font-medium">
              Nama
            </label>
            <input
              id="pengelola-name"
              type="text"
              className={inputClass}
              placeholder="Nama lengkap"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pengelola-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="pengelola-email"
              type="email"
              className={inputClass}
              placeholder="nama@email.com"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pengelola-phone" className="text-sm font-medium">
              Nomor telepon
            </label>
            <input
              id="pengelola-phone"
              type="tel"
              className={inputClass}
              placeholder="081234567890"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pengelola-bank" className="text-sm font-medium">
              Bank sampah
            </label>
            <select
              id="pengelola-bank"
              className={inputClass}
              value={form.waste_bank_id}
              onChange={(event) => updateField("waste_bank_id", event.target.value)}
              required
            >
              <option value="">Pilih bank sampah</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name} ({bank.region})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="pengelola-password" className="text-sm font-medium">
              Kata sandi
            </label>
            <input
              id="pengelola-password"
              type="password"
              className={inputClass}
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pengelola-confirm-password"
              className="text-sm font-medium"
            >
              Konfirmasi kata sandi
            </label>
            <input
              id="pengelola-confirm-password"
              type="password"
              className={inputClass}
              placeholder="Ulangi kata sandi"
              value={form.confirm_password}
              onChange={(event) =>
                updateField("confirm_password", event.target.value)
              }
              required
            />
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="text-sm text-green-600" role="status">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-foreground px-5 py-3 text-base font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#ccc] sm:w-auto"
        >
          {loading ? "Membuat..." : "Buat Akun Pengelola"}
        </button>
      </form>
    </div>
  );
}
