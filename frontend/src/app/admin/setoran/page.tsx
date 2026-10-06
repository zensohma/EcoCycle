import { AdminFilterPage } from "@/features/admin/components/admin-filter-page";

const OPTIONS = [
  "Semua",
  "Menunggu Verifikasi",
  "Diverifikasi",
  "Ditolak",
] as const;

export default function AdminSetoranPage() {
  return (
    <AdminFilterPage
      title="Setoran Sampah"
      subtitle="Kelola dan verifikasi setoran pelanggan."
      options={OPTIONS}
      emptyMessage="Belum ada data setoran."
    />
  );
}
