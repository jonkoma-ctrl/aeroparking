"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Apaga una tarifa vieja que la web no usa (lo único que se le puede hacer). */
export function TurnOffButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function turnOff() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: false }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo apagar");
      return;
    }
    router.refresh();
  }

  return (
    <span>
      <button onClick={turnOff} disabled={loading}
        className="rounded border border-brand-200 px-2 py-0.5 text-xs text-brand-600 hover:bg-brand-50 disabled:opacity-50">
        {loading ? "..." : "Apagar"}
      </button>
      {error && <span className="ml-2 text-xs text-red-700">{error}</span>}
    </span>
  );
}
