import { AdminEmpty } from "@/features/admin/components/admin-empty";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

export default function AdminNotifikasiPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifikasi"
        subtitle="Pemberitahuan aktivitas EcoCycle terbaru."
      />

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <AdminEmpty message="Belum ada notifikasi." />
      </div>
    </div>
  );
}
