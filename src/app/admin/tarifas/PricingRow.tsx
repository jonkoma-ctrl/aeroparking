"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface PricingRowProps {
  id: string;
  destination: string;
  serviceType: string;
  pricePerDay: number;
  description: string | null;
  active: boolean;
  updatedAt: string;
}

export function PricingRow({
  id,
  destination,
  serviceType,
  pricePerDay,
  description,
  active,
  updatedAt,
}: PricingRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(pricePerDay));
  const [loading, setLoading] = useState(false);

  async function savePrice() {
    setLoading(true);
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pricePerDay: parseInt(price, 10) }),
    });
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  async function toggleActive() {
    setLoading(true);
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="hover:bg-brand-50">
      <td className="px-4 py-3 font-medium text-brand-900">{destination}</td>
      <td className="px-4 py-3 text-brand-700">{serviceType}</td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex items-center gap-1">
            <span className="text-brand-500">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-24 rounded border border-brand-300 px-2 py-1 text-sm"
              autoFocus
            />
            <button
              onClick={savePrice}
              disabled={loading}
              className="rounded bg-brand-900 px-2 py-1 text-xs text-white"
            >
              {loading ? "..." : "OK"}
            </button>
            <button
              onClick={() => { setEditing(false); setPrice(String(pricePerDay)); }}
              className="px-1 text-xs text-brand-400"
            >
              X
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="font-mono font-semibold text-brand-900 hover:text-brand-600 hover:underline"
          >
            {formatPrice(pricePerDay)}
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-brand-500">{description || "—"}</td>
      <td className="px-4 py-3">
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {active ? "Activa" : "Inactiva"}
        </button>
      </td>
      <td className="px-4 py-3 text-xs text-brand-400">{updatedAt}</td>
      <td className="px-4 py-3" />
    </tr>
  );
}
