export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
};

type RegisterResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  waste_bank_id?: string | null;
};

export type ManagedWasteBank = {
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

type UpdateWasteBankPayload = {
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  operating_hours: string | null;
  deposit_procedure: string | null;
};

type WasteBankSummary = {
  id: string;
  name: string;
  region: string;
  is_active: boolean;
};

type CreatePengelolaPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  waste_bank_id: string;
};

type CreatePengelolaResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  waste_bank_id: string;
};

async function parseError(response: Response): Promise<string> {
  const error = await response.json().catch(() => null);
  if (error && typeof error.detail === "string") return error.detail;
  return "Terjadi kesalahan. Coba lagi.";
}

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as RegisterResponse;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as LoginResponse;
}

export async function logoutUser(): Promise<void> {
  const csrf = getCsrfToken();
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: csrf ? { "X-CSRF-Token": csrf } : {},
  });
}

export async function getCurrentUser(): Promise<LoginResponse | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (!response.ok) return null;
  return (await response.json()) as LoginResponse;
}

export async function listWasteBanks(): Promise<WasteBankSummary[]> {
  const response = await fetch(`${API_BASE_URL}/admin/waste-banks`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as WasteBankSummary[];
}

export async function createPengelola(
  payload: CreatePengelolaPayload,
): Promise<CreatePengelolaResponse> {
  const csrf = getCsrfToken();
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as CreatePengelolaResponse;
}

export async function getManagedWasteBank(
  wasteBankId: string,
): Promise<ManagedWasteBank> {
  const response = await fetch(
    `${API_BASE_URL}/waste-banks/${wasteBankId}/manage`,
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ManagedWasteBank;
}

export async function updateWasteBank(
  wasteBankId: string,
  payload: UpdateWasteBankPayload,
): Promise<ManagedWasteBank> {
  const csrf = getCsrfToken();
  const response = await fetch(`${API_BASE_URL}/waste-banks/${wasteBankId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ManagedWasteBank;
}
