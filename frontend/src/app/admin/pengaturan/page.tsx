"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  getCurrentUser,
  getManagedWasteBank,
  listWasteBanks,
  updateWasteBank,
  type ManagedWasteBank,
} from "@/lib/api";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  operating_hours: string;
  deposit_procedure: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  operating_hours: "",
  deposit_procedure: "",
};

const SLOGAN = "Dari Sampah Jadi Berharga";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-200";
const labelClass = "text-sm font-semibold text-foreground";

function toFormState(bank: ManagedWasteBank): FormState {
  return {
    name: bank.name,
    phone: bank.phone ?? "",
    email: bank.email ?? "",
    address: bank.address,
    operating_hours: bank.operating_hours ?? "",
    deposit_procedure: bank.deposit_procedure ?? "",
  };
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={inputClass}
        value={value}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        title={readOnly ? "Slogan bawaan aplikasi, tidak dapat diubah" : undefined}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}

export default function AdminPengaturanPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [bankId, setBankId] = useState<string | null>(null);
  const [banks, setBanks] = useState<
    { id: string; name: string; region: string }[]
  >([]);
  const [isAdministrator, setIsAdministrator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBank(id: string) {
      const bank = await getManagedWasteBank(id);
      if (cancelled) return;
      setBankId(bank.id);
      setForm(toFormState(bank));
    }

    async function init() {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;

        if (!user) {
          setError("Sesi berakhir. Silakan masuk kembali.");
          return;
        }

        const admin = user.role === "administrator";
        setIsAdministrator(admin);

        if (admin) {
          const list = await listWasteBanks();
          if (cancelled) return;
          setBanks(list);
          const preferred = user.waste_bank_id ?? list[0]?.id ?? null;
          if (preferred) await loadBank(preferred);
        } else if (user.waste_bank_id) {
          await loadBank(user.waste_bank_id);
        } else {
          setError("Akun Anda tidak terikat pada bank sampah.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat data bank sampah",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field: keyof FormState, value: string) {
    setSuccess(null);
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function switchBank(id: string) {
    if (!id) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const bank = await getManagedWasteBank(id);
      setBankId(bank.id);
      setForm(toFormState(bank));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data bank sampah",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (!bankId) {
      setError("Pilih bank sampah terlebih dahulu");
      return;
    }
    if (!form.name.trim() || !form.address.trim()) {
      setError("Nama bank sampah dan alamat wajib diisi");
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Format email admin tidak valid");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateWasteBank(bankId, {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        operating_hours: form.operating_hours.trim() || null,
        deposit_procedure: form.deposit_procedure.trim() || null,
      });
      setForm(toFormState(updated));
      setSuccess("Perubahan tersimpan dan langsung tampil pada halaman publik.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengaturan"
        subtitle="Atur informasi Bank Sampah EcoCycle."
      />

      <form
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        {loading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Memuat data bank sampah...
          </p>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {isAdministrator ? (
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="bank-sampah" className={labelClass}>
                    Bank Sampah
                  </label>
                  <select
                    id="bank-sampah"
                    className={inputClass}
                    value={bankId ?? ""}
                    onChange={(event) => void switchBank(event.target.value)}
                  >
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name} ({bank.region})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <Field
                id="nama-bank"
                label="Nama Bank Sampah"
                value={form.name}
                onChange={(value) => updateField("name", value)}
              />
              <Field id="slogan" label="Slogan" value={SLOGAN} readOnly />
              <Field
                id="wa-admin"
                label="Nomor WhatsApp Admin"
                value={form.phone}
                type="tel"
                onChange={(value) => updateField("phone", value)}
              />
              <Field
                id="email-admin"
                label="Email Admin"
                value={form.email}
                type="email"
                onChange={(value) => updateField("email", value)}
              />
              <Field
                id="alamat"
                label="Alamat Bank Sampah"
                value={form.address}
                onChange={(value) => updateField("address", value)}
              />
              <Field
                id="jam-operasional"
                label="Jam Operasional"
                value={form.operating_hours}
                onChange={(value) => updateField("operating_hours", value)}
              />

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="prosedur" className={labelClass}>
                  Prosedur Penyetoran
                </label>
                <textarea
                  id="prosedur"
                  rows={4}
                  className={inputClass}
                  value={form.deposit_procedure}
                  placeholder="Cara menyetor sampah di bank sampah ini"
                  onChange={(event) =>
                    updateField("deposit_procedure", event.target.value)
                  }
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
              disabled={saving || !bankId}
              className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
