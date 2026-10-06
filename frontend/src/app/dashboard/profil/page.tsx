"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@/features/shell/components/icons";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getCurrentUser } from "@/lib/api";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl text-brand-900">{value}</p>
    </div>
  );
}

function ProfileView() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const initial = user?.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-100 font-serif text-3xl text-brand-700">
          {initial}
        </span>
        <p className="mt-4 font-serif text-xl text-brand-900">
          {user?.name ?? "Memuat..."}
        </p>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          {user ? (
            <>
              <p>{user.phone || "Nomor HP belum diisi"}</p>
              <p>{user.email}</p>
            </>
          ) : null}
          <p>Alamat belum diisi</p>
        </div>
        <div className="mt-5 flex justify-center">
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
        <StatCard label="Total Setoran" value="0" />
        <StatCard label="Total Berat" value="0 Kg" />
        <StatCard label="Total Pendapatan" value="Rp 0" />
        <StatCard label="Saldo Saat Ini" value="Rp 0" />
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-brand-900 sm:text-4xl">
            Profil Saya
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola informasi akun EcoCycle Anda.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white opacity-60"
          title="Segera hadir"
        >
          Edit Profil
        </button>
      </div>

      <ProfileView />
    </div>
  );
}
