import { AdminFilterPage } from "@/features/admin/components/admin-filter-page";

const OPTIONS = ["Semua", "Menunggu Diproses", "Selesai", "Ditolak"] as const;

export default function AdminPenarikanPage() {
  return (
    <AdminFilterPage
      title="Penarikan Saldo"
      subtitle="Periksa dan proses permintaan penarikan."
      options={OPTIONS}
      emptyMessage="Belum ada permintaan penarikan."
    />
  );
}
