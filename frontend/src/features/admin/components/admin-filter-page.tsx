"use client";

import { useState } from "react";
import { AdminEmpty } from "./admin-empty";
import { AdminPageHeader } from "./admin-page-header";
import { FilterChips } from "./filter-chips";

export function AdminFilterPage({
  title,
  subtitle,
  options,
  emptyMessage,
}: {
  title: string;
  subtitle: string;
  options: readonly string[];
  emptyMessage: string;
}) {
  const [active, setActive] = useState<string>(options[0] ?? "Semua");

  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} subtitle={subtitle} />
      <FilterChips options={options} value={active} onChange={setActive} />
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <AdminEmpty message={emptyMessage} />
      </div>
    </div>
  );
}
