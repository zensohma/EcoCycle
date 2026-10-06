import { AdminEmpty } from "@/features/admin/components/admin-empty";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

const STATS: { label: string; value: string; accent?: boolean }[] = [
  { label: "Total Pelanggan", value: "0" },
  { label: "Setoran Menunggu", value: "0" },
  { label: "Jemput Hari Ini", value: "0" },
  { label: "Penarikan Menunggu", value: "0" },
  { label: "Total Sampah", value: "0 kg", accent: true },
  { label: "Total Nilai Sampah", value: "Rp 0", accent: true },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        subtitle="Pantau seluruh aktivitas EcoCycle hari ini."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${
                stat.accent ? "text-brand-600" : "text-foreground"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-bold text-foreground">
          Aktivitas Terbaru
        </h2>
        <AdminEmpty message="Belum ada data." />
      </section>
    </div>
  );
}
