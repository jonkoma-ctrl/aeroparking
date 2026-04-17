"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface Discount { fromDays: number; pctOff: number }

interface PricingRowProps {
  id: string;
  destination: string;
  serviceType: string;
  pricePerDay: number;
  description: string | null;
  active: boolean;
  isReference?: boolean;
  externalCheckoutUrl?: string | null;
  minDays?: number | null;
  maxDays?: number | null;
  durationDiscounts?: Discount[] | null;
  updatedAt: string;
}

export function PricingRow(props: PricingRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  // Advanced fields state
  const [price, setPrice] = useState(String(props.pricePerDay));
  const [isReference, setIsReference] = useState(props.isReference || false);
  const [externalUrl, setExternalUrl] = useState(props.externalCheckoutUrl || "");
  const [minDays, setMinDays] = useState(props.minDays ? String(props.minDays) : "");
  const [maxDays, setMaxDays] = useState(props.maxDays ? String(props.maxDays) : "");
  const [discounts, setDiscounts] = useState<Discount[]>(props.durationDiscounts || []);

  async function saveAll() {
    setLoading(true);
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: props.id,
        pricePerDay: parseInt(price, 10),
        isReference,
        externalCheckoutUrl: externalUrl || null,
        minDays: minDays ? parseInt(minDays, 10) : null,
        maxDays: maxDays ? parseInt(maxDays, 10) : null,
        durationDiscounts: discounts.length > 0 ? discounts : null,
      }),
    });
    setShowAdvanced(false);
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  async function toggleActive() {
    setLoading(true);
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: props.id, active: !props.active }),
    });
    setLoading(false);
    router.refresh();
  }

  function addDiscount() {
    setDiscounts([...discounts, { fromDays: 7, pctOff: 5 }]);
  }
  function updateDiscount(idx: number, field: keyof Discount, value: string) {
    const copy = [...discounts];
    copy[idx] = { ...copy[idx], [field]: parseInt(value, 10) || 0 };
    setDiscounts(copy);
  }
  function removeDiscount(idx: number) {
    setDiscounts(discounts.filter((_, i) => i !== idx));
  }

  const hasDiscounts = (props.durationDiscounts?.length || 0) > 0;

  return (
    <>
      <tr className="hover:bg-brand-50">
        <td className="px-4 py-3 font-medium text-brand-900">{props.destination}</td>
        <td className="px-4 py-3 text-brand-700">{props.serviceType}</td>
        <td className="px-4 py-3">
          {editing ? (
            <div className="flex items-center gap-1">
              <span className="text-brand-500">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-24 rounded border border-brand-300 px-2 py-1 text-sm" autoFocus />
              <button onClick={saveAll} disabled={loading}
                className="rounded bg-brand-900 px-2 py-1 text-xs text-white">
                {loading ? "..." : "OK"}
              </button>
              <button onClick={() => { setEditing(false); setPrice(String(props.pricePerDay)); }}
                className="px-1 text-xs text-brand-400">X</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)}
              className="font-mono font-semibold text-brand-900 hover:text-brand-600 hover:underline">
              {formatPrice(props.pricePerDay)}
            </button>
          )}
        </td>
        <td className="px-4 py-3 text-brand-500 text-xs">
          {props.isReference && (
            <span className="mr-2 inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              Referencia
            </span>
          )}
          {props.description || "—"}
          {hasDiscounts && (
            <span className="ml-2 inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
              {props.durationDiscounts!.length} desc.
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <button onClick={toggleActive} disabled={loading}
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              props.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
            }`}>
            {props.active ? "Activa" : "Inactiva"}
          </button>
        </td>
        <td className="px-4 py-3 text-xs text-brand-400">{props.updatedAt}</td>
        <td className="px-4 py-3">
          <button onClick={() => setShowAdvanced(true)}
            className="rounded border border-brand-200 px-2 py-1 text-xs text-brand-600 hover:bg-brand-50">
            ⚙ Avanzado
          </button>
        </td>
      </tr>

      {showAdvanced && (
        <tr>
          <td colSpan={7} className="bg-brand-50 px-4 py-4">
            <div className="rounded-xl bg-white p-5 border border-brand-200">
              <h3 className="mb-4 text-sm font-semibold text-brand-900">
                Configuración avanzada — {props.destination} / {props.serviceType}
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-600">
                    <input type="checkbox" checked={isReference}
                      onChange={(e) => setIsReference(e.target.checked)}
                      className="mr-2" />
                    Es precio de referencia (checkout externo AA2000)
                  </label>
                  {isReference && (
                    <input type="url" value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://tienda.aeropuertosargentina.com/..."
                      className="mt-1 w-full rounded border border-brand-200 px-2 py-1.5 text-sm" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-brand-600">Mín. días</label>
                    <input type="number" value={minDays} onChange={(e) => setMinDays(e.target.value)}
                      placeholder="sin mínimo"
                      className="w-full rounded border border-brand-200 px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-brand-600">Máx. días</label>
                    <input type="number" value={maxDays} onChange={(e) => setMaxDays(e.target.value)}
                      placeholder="sin máximo"
                      className="w-full rounded border border-brand-200 px-2 py-1.5 text-sm" />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-brand-600">Descuentos por duración</label>
                  <button onClick={addDiscount}
                    className="text-xs font-medium text-brand-600 hover:text-brand-900">
                    + Agregar descuento
                  </button>
                </div>
                {discounts.length === 0 ? (
                  <p className="text-xs text-brand-400 italic">Sin descuentos configurados. El precio será lineal (días × precio).</p>
                ) : (
                  <div className="space-y-2">
                    {discounts.map((d, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-brand-500">Desde</span>
                        <input type="number" value={d.fromDays}
                          onChange={(e) => updateDiscount(idx, "fromDays", e.target.value)}
                          className="w-16 rounded border border-brand-200 px-2 py-1 text-sm" />
                        <span className="text-xs text-brand-500">días →</span>
                        <input type="number" value={d.pctOff}
                          onChange={(e) => updateDiscount(idx, "pctOff", e.target.value)}
                          className="w-16 rounded border border-brand-200 px-2 py-1 text-sm" />
                        <span className="text-xs text-brand-500">% off</span>
                        <button onClick={() => removeDiscount(idx)}
                          className="ml-2 text-xs text-red-500 hover:text-red-700">Eliminar</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button onClick={saveAll} disabled={loading}
                  className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50">
                  {loading ? "Guardando..." : "Guardar cambios"}
                </button>
                <button onClick={() => setShowAdvanced(false)}
                  className="rounded-lg px-4 py-2 text-sm text-brand-500 hover:text-brand-700">
                  Cancelar
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
