"use client";

import { useRouter } from "next/navigation";
import { RefreshIcon } from "@/features/shell/components/icons";

export function AdminPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground sm:text-[26px]">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-200"
      >
        <RefreshIcon className="h-4 w-4" />
        Refresh data
      </button>
    </div>
  );
}
