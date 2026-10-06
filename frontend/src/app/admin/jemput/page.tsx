import { AdminFilterPage } from "@/features/admin/components/admin-filter-page";

const OPTIONS = [
  "Semua",
  "Menunggu Penjemputan",
  "Dijadwalkan",
  "Sedang Dijemput",
  "Sampai di Lokasi",
  "Ditimbang",
  "Selesai",
] as const;

export default function AdminJemputPage() {
  return (
    <AdminFilterPage
      title="Jemput Sampah"
      subtitle="Atur status dan hasil penimbangan jemputan."
      options={OPTIONS}
      emptyMessage="Belum ada permintaan jemput."
    />
  );
}
