"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface Discount { fromDays: number; pctOff: number }
interface Tier { days: number; price: number }

export interface TariffData {
  id: string;
  pricePerDay: number;
  description: string | null;
  active: boolean;
  durationDiscounts: Discount[] | null;
  transferIncluded: boolean;
  transferCostPerLeg: number | null;
  priceTable: Tier[] | null;
  extraDayPrice: number | null;
  updatedAt: string;
}

interface TariffCardProps {
  slug: string;
  destinationLabel: string;
  destinationActive: boolean;
  /** La tarifa está activa y cotiza más de $0. */
  quotes: boolean;
  /** La fila que cobra la web para este destino; null si todavía no existe. */
  tariff: TariffData | null;
}

/**
 * Tarjeta de un destino en /admin/tarifas: muestra y edita la ÚNICA tarifa que
 * cobra la web para ese destino. El operador nunca elige la fila: la decide el
 * destino (ver webServiceTypeFor) y la API rechaza cualquier otra.
 */
export function TariffCard({ slug, destinationLabel, destinationActive, quotes, tariff }: TariffCardProps) {
  return (
    <div className="rounded-xl border border-brand-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-900">{destinationLabel}</h2>
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {destinationActive ? (
              <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
                Destino activo: se vende en la web
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-500">
                Destino apagado
              </span>
            )}
            {quotes ? (
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-800">
                Con precio
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                Sin precio
              </span>
            )}
          </div>
        </div>
        {tariff && <span className="text-xs text-brand-400">Actualizada {tariff.updatedAt}</span>}
      </div>

      {!quotes && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {destinationActive
            ? "La web no puede cotizar este destino: nadie puede reservarlo hasta que tenga precio."
            : "Cargale el precio acá y después activá el destino en Destinos."}
        </p>
      )}

      {tariff ? <TariffEditor tariff={tariff} /> : <CreateTariff slug={slug} />}
    </div>
  );
}

function CreateTariff({ slug }: { slug: string }) {
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!price) return;
    setLoading(true);
    setError(null);
    // Sólo destino y precio: la fila (serviceType) la decide el servidor.
    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination: slug, pricePerDay: parseInt(price, 10) }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo guardar");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={create} className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs text-brand-500">Precio por día ($)</label>
        <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder="38000" required
          className="w-36 rounded-md border border-brand-200 px-3 py-2 text-sm" />
      </div>
      <button type="submit" disabled={loading || !price}
        className="rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50">
        {loading ? "..." : "Crear tarifa"}
      </button>
      <span className="text-xs text-brand-500">Después podés cargarle la grilla por días.</span>
      {error && <p className="w-full text-sm text-red-700">{error}</p>}
    </form>
  );
}

function TariffEditor({ tariff }: { tariff: TariffData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [price, setPrice] = useState(String(tariff.pricePerDay));
  const [discounts, setDiscounts] = useState<Discount[]>(tariff.durationDiscounts || []);
  const [transferIncluded, setTransferIncluded] = useState(tariff.transferIncluded !== false);
  const [transferCostPerLeg, setTransferCostPerLeg] = useState(tariff.transferCostPerLeg ? String(tariff.transferCostPerLeg) : "");
  const [tiers, setTiers] = useState<Tier[]>(
    (tariff.priceTable || []).slice().sort((a, b) => a.days - b.days)
  );
  const [extraDayPrice, setExtraDayPrice] = useState(tariff.extraDayPrice ? String(tariff.extraDayPrice) : "");

  async function patch(body: Record<string, unknown>): Promise<boolean> {
    setError(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tariff.id, ...body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo guardar");
        return false;
      }
      return true;
    } catch {
      setError("No se pudo guardar");
      return false;
    }
  }

  async function saveAll() {
    setLoading(true);
    const cleanTiers = tiers
      .filter((t) => t.days > 0 && t.price >= 0)
      .sort((a, b) => a.days - b.days);
    const ok = await patch({
      pricePerDay: parseInt(price, 10) || 0,
      // minDays/maxDays quedan deprecados: el rango de precios lo define la grilla.
      minDays: null,
      maxDays: null,
      durationDiscounts: discounts.length > 0 ? discounts : null,
      transferIncluded,
      transferCostPerLeg: transferCostPerLeg ? parseInt(transferCostPerLeg, 10) : null,
      priceTable: cleanTiers.length > 0 ? cleanTiers : null,
      extraDayPrice: extraDayPrice ? parseInt(extraDayPrice, 10) : null,
    });
    setLoading(false);
    if (!ok) return;
    setOpen(false);
    router.refresh();
  }

  async function toggleActive() {
    setLoading(true);
    const ok = await patch({ active: !tariff.active });
    setLoading(false);
    if (ok) router.refresh();
  }

  function cancel() {
    setPrice(String(tariff.pricePerDay));
    setDiscounts(tariff.durationDiscounts || []);
    setTransferIncluded(tariff.transferIncluded !== false);
    setTransferCostPerLeg(tariff.transferCostPerLeg ? String(tariff.transferCostPerLeg) : "");
    setTiers((tariff.priceTable || []).slice().sort((a, b) => a.days - b.days));
    setExtraDayPrice(tariff.extraDayPrice ? String(tariff.extraDayPrice) : "");
    setError(null);
    setOpen(false);
  }

  function updateDiscount(idx: number, field: keyof Discount, value: string) {
    const copy = [...discounts];
    copy[idx] = { ...copy[idx], [field]: parseInt(value, 10) || 0 };
    setDiscounts(copy);
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

  const table = (tariff.priceTable || []).slice().sort((a, b) => a.days - b.days);

  return (
    <div className="mt-4">
      {/* Resumen */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {table.length > 0 ? (
          <div className="text-brand-700">
            <span className="font-semibold text-brand-900">Grilla · {table.length} tramos:</span>{" "}
            {table.slice(0, 4).map((t) => `${t.days} día${t.days !== 1 ? "s" : ""} ${formatPrice(t.price)}`).join(" · ")}
            {table.length > 4 && " · …"}
            {tariff.extraDayPrice ? ` · día adicional ${formatPrice(tariff.extraDayPrice)}` : ""}
          </div>
        ) : (
          <div className="text-brand-700">
            <span className="font-semibold text-brand-900">Precio por día:</span>{" "}
            <span className="font-mono">{formatPrice(tariff.pricePerDay)}</span>
          </div>
        )}
        {!tariff.transferIncluded && (
          <span className="text-xs text-amber-700">
            Traslado aparte{tariff.transferCostPerLeg ? `: ${formatPrice(tariff.transferCostPerLeg)} por tramo` : ""}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setOpen(!open)}
          className="rounded-md bg-brand-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-800">
          {open ? "Cerrar" : "Editar precios"}
        </button>
        <button onClick={toggleActive} disabled={loading}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            tariff.active
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}>
          {tariff.active ? "Tarifa activa (tocá para apagar)" : "Tarifa apagada (tocá para activar)"}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <span>
            {error}{" "}
            {/Destinos/.test(error) && <a href="/admin/destinos" className="font-semibold underline">Ir a Destinos</a>}
          </span>
          <button onClick={() => setError(null)} className="text-xs text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {open && (
        <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/50 p-5">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-brand-800">Precio por día (sin grilla):</label>
            <span className="text-brand-500">$</span>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)}
              className="w-32 rounded border border-brand-200 px-2 py-1.5 text-sm" />
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <label className="block text-xs font-medium text-amber-800">
              <input type="checkbox" checked={transferIncluded}
                onChange={(e) => setTransferIncluded(e.target.checked)} className="mr-2" />
              Traslado incluido en el precio
            </label>
            {!transferIncluded && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-amber-700">Costo por tramo:</span>
                <span className="text-amber-700">$</span>
                <input type="number" value={transferCostPerLeg}
                  onChange={(e) => setTransferCostPerLeg(e.target.value)} placeholder="40000"
                  className="w-24 rounded border border-amber-300 px-2 py-1 text-sm" />
              </div>
            )}
          </div>

          {/* Grilla de precios por cantidad de días */}
          <div className="mt-5 rounded-lg border border-brand-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold text-brand-800">💵 Grilla de precios por día</label>
              <button onClick={addTier}
                className="rounded-md bg-brand-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-800">
                + Agregar tramo
              </button>
            </div>
            <p className="mb-3 text-xs text-brand-500">
              Cargá el precio TOTAL para cada cantidad de días (ej: 1 día = $39.000, 2 días = $70.000).
              Si cargás la grilla, <strong>tiene prioridad</strong> sobre el precio por día.
            </p>
            {tiers.length === 0 ? (
              <p className="text-xs italic text-brand-400">
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
                    <button onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}
                      className="text-xs text-red-500 hover:text-red-700">✕</button>
                  </div>
                ))}
                <div className="mt-3 flex items-center gap-2 border-t border-brand-200 pt-3">
                  <span className="text-xs text-brand-600">Cada día adicional (después del último tramo):</span>
                  <span className="text-brand-500">$</span>
                  <input type="number" min={0} step={1000} value={extraDayPrice}
                    onChange={(e) => setExtraDayPrice(e.target.value)} placeholder="ej: 12000"
                    className="w-28 rounded border border-brand-200 px-2 py-1.5 text-sm" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-brand-600">Descuentos por duración (opcional, sólo si NO usás grilla)</label>
              <button onClick={() => setDiscounts([...discounts, { fromDays: 7, pctOff: 5 }])}
                className="text-xs font-medium text-brand-600 hover:text-brand-900">
                + Agregar descuento
              </button>
            </div>
            {discounts.length === 0 ? (
              <p className="text-xs italic text-brand-400">Sin descuentos configurados.</p>
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
                    <button onClick={() => setDiscounts(discounts.filter((_, i) => i !== idx))}
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
            <button onClick={cancel} className="rounded-lg px-4 py-2 text-sm text-brand-500 hover:text-brand-700">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
