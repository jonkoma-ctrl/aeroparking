"use client";

import { useState } from "react";
import { Loader2, RotateCw } from "lucide-react";

export function RetryPayButton({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reservas/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservationId }),
      });
      const data = await res.json();
      if (res.ok && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      setError(data.error || "No pudimos iniciar el pago.");
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={retry}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
        Volver a intentar el pago
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
