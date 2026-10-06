import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

const PRICES: { name: string; price: string }[] = [
  { name: "Plastik", price: "Rp 3.000" },
  { name: "Kertas", price: "Rp 2.500" },
  { name: "Kardus", price: "Rp 2.000" },
  { name: "Besi", price: "Rp 5.000" },
  { name: "Aluminium", price: "Rp 10.000" },
  { name: "Botol/Kaca", price: "Rp 1.500" },
  { name: "Kaleng", price: "Rp 4.000" },
  { name: "Lainnya", price: "Rp 1.000" },
];

export default function AdminHargaPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Harga Sampah"
        subtitle="Harga aktif berlaku untuk transaksi baru."
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="bg-brand-50/70 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-3">Jenis</th>
                <th className="px-6 py-3">Harga/Kg</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {PRICES.map((row) => (
                <tr key={row.name} className="border-t border-border">
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {row.price}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                      Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      disabled
                      title="Segera hadir"
                      className="rounded-lg bg-brand-700 px-4 py-1.5 text-xs font-bold text-white opacity-70"
                    >
                      EDIT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
