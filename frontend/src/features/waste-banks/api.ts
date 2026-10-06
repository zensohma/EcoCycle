import { API_BASE_URL } from "@/lib/api";

export type PublicWasteBank = {
  id: string;
  name: string;
  address: string;
  region: string;
  phone: string | null;
  email: string | null;
  operating_hours: string | null;
  deposit_procedure: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
};

export async function getWasteBanks(q?: string): Promise<PublicWasteBank[]> {
  const url = new URL(`${API_BASE_URL}/waste-banks`);
  if (q && q.trim()) url.searchParams.set("q", q.trim());

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) throw new Error("Gagal memuat daftar bank sampah");
  return (await response.json()) as PublicWasteBank[];
}

export async function getWasteBank(id: string): Promise<PublicWasteBank> {
  const response = await fetch(`${API_BASE_URL}/waste-banks/${id}`, {
    cache: "no-store",
  });
  if (response.status === 404) throw new Error("Bank sampah tidak ditemukan");
  if (!response.ok) throw new Error("Gagal memuat bank sampah");
  return (await response.json()) as PublicWasteBank;
}

export function mapsLink(bank: {
  latitude: number | null;
  longitude: number | null;
  address: string;
}): string {
  const query =
    bank.latitude != null && bank.longitude != null
      ? `${bank.latitude},${bank.longitude}`
      : bank.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
