"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "@/features/shell/components/icons";
import { logoutUser } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      setLoading(false);
      router.push("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
    >
      <LogOutIcon className="h-4 w-4" />
      {loading ? "Keluar..." : "Keluar"}
    </button>
  );
}
