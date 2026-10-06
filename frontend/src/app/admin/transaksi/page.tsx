import { AdminFilterPage } from "@/features/admin/components/admin-filter-page";

const OPTIONS = ["Semua", "Uang Masuk", "Uang Keluar"] as const;

export default function AdminTransaksiPage() {
  return (
    <AdminFilterPage
      title="Transaksi"
      subtitle="Riwayat transaksi nyata EcoCycle."
      options={OPTIONS}
      emptyMessage="Belum ada transaksi."
    />
  );
}
