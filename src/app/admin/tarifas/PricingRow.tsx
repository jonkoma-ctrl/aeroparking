"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface Discount { fromDays: number; pctOff: number }
interface Tier { days: number; price: number }

interface PricingRowProps {
  id: string;
  destination: string;
  serviceType: string;
  pricePerDay: number;
  description: string | null;
  active: boolean;
  minDays?: number | null;
  maxDays?: number | null;
  durationDiscounts?: Discount[] | null;
  transferIncluded?: boolean;
  transferCostPerLeg?: number | null;
  priceTable?: Tier[] | null;
  extraDayPrice?: number | null;
  updatedAt: string;
}

export function PricingRow(props: PricingRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  // Advanced fields state
  const [price, setPrice] = useState(String(props.pricePerDay));
  const [discounts, setDiscounts] = useState<Discount[]>(props.durationDiscounts || []);
  const [transferIncluded, setTransferIncluded] = useState(props.transferIncluded !== false);
  const [transferCostPerLeg, setTransferCostPerLeg] = useState(props.transferCostPerLeg ? String(props.transferCostPerLeg) : "");
  const [tiers, setTiers] = useState<Tier[]>(
    (props.priceTable || []).slice().sort((a, b) => a.days - b.days)
  );
  const [extraDayPrice, setExtraDayPrice] = useState(props.extraDayPrice ? String(props.extraDayPrice) : "");

  async function saveAll() {
    setLoading(true);
    const cleanTiers = tiers
      .filter((t) => t.days > 0 && t.price >= 0)
      .sort((a, b) => a.days - b.days);
    await fetch("/api/admin/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: props.id,
        pricePerDay: parseInt(price, 10),
        // minDays/maxDays quedan deprecados — limpiamos cualquier valor viejo
        // que confundía y rompía las cotizaciones. El rango de precios lo
        // define la grilla, no estos campos.
        minDays: null,
        maxDays: null,
        durationDiscounts: discounts.length > 0 ? discounts : null,
        transferIncluded,
        transferCostPerLeg: transferCostPerLeg ? parseInt(transferCostPerLeg, 10) : null,
        priceTable: cleanTiers.length > 0 ? cleanTiers : null,
        extraDayPrice: extraDayPrice ? parseInt(extraDayPrice, 10) : null,
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

  function addTier() {
    const lastDays = tiers.length > 0 ? Math.max(...tiers.map((t) => t.days)) : 0;
    setTiers([...tiers, { days: lastDays + 1, price: 0 }]);
  }
  function updateTier(idx: number, field: keyof Tier, value: string) {
    const copy = [...tiers];
    copy[idx] = { ...copy[idx], [field]: parseInt(value, 10) || 0 };
    setTiers(copy);
  }
  function removeTier(idx: number) {
    setTiers(tiers.filter((_, i) => i !== idx));
  }

  const hasDiscounts = (props.durationDiscounts?.length || 0) > 0;
  const hasTable = (props.priceTable?.length || 0) > 0;

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
          {props.description || "—"}
          {hasTable && (
            <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              Grilla · {props.priceTable!.length} tramos
            </span>
          )}
          {hasDiscounts && !hasTable && (
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

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <label className="mb-2 block text-xs font-medium text-amber-800">
                  <input type="checkbox" checked={transferIncluded}
                    onChange={(e) => setTransferIncluded(e.target.checked)}
                    className="mr-2" />
                  Traslado incluido en el precio
                </label>
                {!transferIncluded && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-amber-700">Costo por tramo:</span>
                    <span className="text-amber-700">$</span>
                    <input type="number" value={transferCostPerLeg}
                      onChange={(e) => setTransferCostPerLeg(e.target.value)}
                      placeholder="40000"
                      className="w-24 rounded border border-amber-300 px-2 py-1 text-sm" />
                  </div>
                )}
              </div>

              {/* Grilla de precios por cantidad de días */}
              <div className="mt-5 rounded-lg border border-brand-200 bg-brand-50/50 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-semibold text-brand-800">💵 Grilla de precios por día</label>
                  <button onClick={addTier}
                    className="rounded-md bg-brand-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-800">
                    + Agregar tramo
                  </button>
                </div>
                <p className="mb-3 text-xs text-brand-500">
                  Cargá el precio TOTAL para cada cantidad de días (ej: 1 día = $39.000, 2 días = $70.000).
                  Si cargás la grilla, <strong>tiene prioridad</strong> sobre el precio lineal de arriba.
                </p>

                {tiers.length === 0 ? (
                  <p className="text-xs text-brand-400 italic">
                    Sin grilla. El precio se calcula lineal (cantidad de días × precio por día).
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[11px] font-semibold uppercase tracking-wide text-brand-400">
                      <span>Cantidad de días</span>
                      <span>Precio total</span>
                      <span></span>
                    </div>
                    {tiers.map((t, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <input type="number" min={1} value={t.days}
                            onChange={(e) => updateTier(idx, "days", e.target.value)}
                            className="w-full rounded border border-brand-200 px-2 py-1.5 text-sm" />
                          <span className="text-xs text-brand-500">día{t.days !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-brand-500">$</span>
                          <input type="number" min={0} step={1000} value={t.price}
                            onChange={(e) => updateTier(idx, "price", e.target.value)}
                            className="w-full rounded border border-brand-200 px-2 py-1.5 text-sm" />
                        </div>
                        <button onClick={() => removeTier(idx)}
                          className="text-xs text-red-500 hover:text-red-700">✕</button>
                      </div>
                    ))}
                    {/* Precio por día adicional */}
                    <div className="mt-3 flex items-center gap-2 border-t border-brand-200 pt-3">
                      <span className="text-xs text-brand-600">Cada día adicional (después del último tramo):</span>
                      <span className="text-brand-500">$</span>
                      <input type="number" min={0} step={1000} value={extraDayPrice}
                        onChange={(e) => setExtraDayPrice(e.target.value)}
                        placeholder="ej: 12000"
                        className="w-28 rounded border border-brand-200 px-2 py-1.5 text-sm" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-brand-600">Descuentos por duración (opcional, solo si NO usás grilla)</label>
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
