"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CheckCircle, Loader2 } from "lucide-react";

interface AeroparqueStatusButtonProps {
  reservationId: string;
  currentStatus: string;
}

export function AeroparqueStatusButton({
  reservationId,
  currentStatus,
}: AeroparqueStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      await fetch(`/api/aeroparque/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-brand-400" />;
  }

  return (
    <div className="flex gap-1">
      {currentStatus !== "completed" && (
        <button
          onClick={() => updateStatus("completed")}
          title="Completar"
          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      )}
      {currentStatus !== "confirmed" && (
        <button
          onClick={() => updateStatus("confirmed")}
          title="Confirmar"
          className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
      {currentStatus !== "cancelled" && (
        <button
          onClick={() => updateStatus("cancelled")}
          title="Cancelar"
          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
