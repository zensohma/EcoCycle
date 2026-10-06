"use client";

import { useState } from "react";
import { AdminEmpty } from "@/features/admin/components/admin-empty";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CreatePengelolaForm } from "@/features/admin/components/create-pengelola-form";
import { SearchIcon } from "@/features/shell/components/icons";

const ROLE_OPTIONS = ["Semua", "Nasabah", "Pengelola", "Administrator"];

export default function AdminPelangganPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("Semua");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pelanggan"
        subtitle="Data pelanggan EcoCycle yang tersedia."
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, email, atau nomor HP.."
              className="w-full rounded-lg border border-border bg-card py-2.5 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-200 sm:w-44"
            aria-label="Filter peran"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <AdminEmpty message="Belum ada data pelanggan." />
      </div>

      <CreatePengelolaForm />
    </div>
  );
}
