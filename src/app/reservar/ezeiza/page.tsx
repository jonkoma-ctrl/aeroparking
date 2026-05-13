"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { decodePrefill } from "@/lib/booking-prefill";
import { calculateStays } from "@/lib/pricing";

function EzeizaContent() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    licensePlate: "", carBrand: "", carModel: "",
    startDate: "", startTime: "10:00",
    endDate: "", endTime: "10:00",
    passengers: "1", notes: "",
  });
  const [transferLegs, setTransferLegs] = useState<number>(parseInt(searchParams.get("legs") || "2", 10));
  const [quote, setQuote] = useState<{
    stays: { fullStays: number; halfStays: number; totalEquivalent: number };
    pricePerStay: number;
    parkingSubtotal: number;
    transferCost: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill from URL
  useEffect(() => {
    const encoded = searchParams.get("prefill");
    if (!encoded) return;
    const payload = decodePrefill(encoded);
    if (!payload) return;
    const startISO = new Date(payload.i);
    const endISO = new Date(payload.r);
    setForm((f) => ({
      ...f,
      startDate: startISO.toISOString().split("T")[0],
      startTime: startISO.toTimeString().slice(0, 5),
      endDate: endISO.toISOString().split("T")[0],
      endTime: endISO.toTimeString().slice(0, 5),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute quote on dates/time/legs change
  useEffect(() => {
    if (!form.startDate || !form.endDate) { setQuote(null); return; }
    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(`${form.endDate}T${form.endTime}:00`);
    if (end <= start) { setQuote(null); return; }
    fetch(`/api/pricing/quote?destino=ezeiza&serviceType=ezeiza_larga_estadia&ingreso=${start.toISOString()}&retiro=${end.toISOString()}&transferLegs=${transferLegs}`)
      .then(r => r.json())
      .then(data => {
        if (data.quote) {
          setQuote({
            stays: { fullStays: data.quote.fullStays, halfStays: data.quote.halfStays, totalEquivalent: data.quote.totalStays },
            pricePerStay: data.quote.pricePerStay,
            parkingSubtotal: data.quote.parkingSubtotal,
            transferCost: data.quote.transferSubtotal,
            total: data.quote.total,
          });
        }
      })
      .catch(() => setQuote(null));
  }, [form.startDate, form.endDate, form.startTime, form.endTime, transferLegs]);

  function updateField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(`${form.endDate}T${form.endTime}:00`);

    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        destination: "ezeiza",
        transferLegs,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      }),
    });

    const data = await res.json();

    if (res.ok && data.initPoint) {
      window.location.href = data.initPoint;
    } else {
      setError(data.error || "Error al crear el pago");
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="section-padding">
      <div className="container-main max-w-xl">
        <h1 className="mb-2 text-2xl font-bold text-brand-900">
          Reservar — Aeropuerto de Ezeiza
        </h1>
        <p className="mb-8 text-sm text-brand-500">
          Estacionamiento en Costa Salguero con traslado opcional a Ezeiza.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos personales */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-2">
              Datos personales
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Nombre" value={form.firstName}
                onChange={e => updateField("firstName", e.target.value)}
                className="rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
              <input required placeholder="Apellido" value={form.lastName}
                onChange={e => updateField("lastName", e.target.value)}
                className="rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
            </div>
            <input required type="email" placeholder="Email" value={form.email}
              onChange={e => updateField("email", e.target.value)}
              className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
            <input placeholder="Teléfono (opcional)" value={form.phone}
              onChange={e => updateField("phone", e.target.value)}
              className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
          </fieldset>

          {/* Vehículo */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-2">
              Vehículo
            </legend>
            <input required placeholder="Patente (ej: AB123CD)" value={form.licensePlate}
              onChange={e => updateField("licensePlate", e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm font-mono" />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Marca" value={form.carBrand}
                onChange={e => updateField("carBrand", e.target.value)}
                className="rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
              <input required placeholder="Modelo" value={form.carModel}
                onChange={e => updateField("carModel", e.target.value)}
                className="rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
            </div>
            <input type="number" placeholder="Pasajeros" value={form.passengers} min="1" max="20"
              onChange={e => updateField("passengers", e.target.value)}
              className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
          </fieldset>

          {/* Fechas + horas */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-2">
              Estadía
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-brand-500 mb-1">Ingreso</label>
                <div className="flex gap-2">
                  <input required type="date" value={form.startDate} min={today}
                    onChange={e => updateField("startDate", e.target.value)}
                    className="flex-1 rounded-lg border border-brand-200 px-2 py-2.5 text-sm" />
                  <input type="time" step={1800} value={form.startTime}
                    onChange={e => updateField("startTime", e.target.value)}
                    className="w-20 rounded-lg border border-brand-200 px-2 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-brand-500 mb-1">Retiro</label>
                <div className="flex gap-2">
                  <input required type="date" value={form.endDate} min={form.startDate || today}
                    onChange={e => updateField("endDate", e.target.value)}
                    className="flex-1 rounded-lg border border-brand-200 px-2 py-2.5 text-sm" />
                  <input type="time" step={1800} value={form.endTime}
                    onChange={e => updateField("endTime", e.target.value)}
                    className="w-20 rounded-lg border border-brand-200 px-2 py-2.5 text-sm" />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Traslado */}
          <fieldset className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
            <legend className="text-sm font-semibold text-amber-800 px-2">
              ✈️ Traslado a Ezeiza
            </legend>
            <p className="text-xs text-amber-700">$40.000 por tramo (~40 km).</p>
            <div className="flex flex-wrap gap-2">
              {[
                { v: 0, l: "Sin traslado" },
                { v: 1, l: "Solo ida" },
                { v: 2, l: "Ida y vuelta" },
              ].map((opt) => (
                <button key={opt.v} type="button" onClick={() => setTransferLegs(opt.v)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    transferLegs === opt.v ? "bg-amber-600 text-white" : "bg-white text-amber-700 hover:bg-amber-100 border border-amber-300"
                  }`}>{opt.l}</button>
              ))}
            </div>
          </fieldset>

          {/* Quote */}
          {quote && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 space-y-2 text-sm">
              <div className="flex justify-between text-brand-600">
                <span>Cochera ({quote.stays.fullStays} {quote.stays.fullStays === 1 ? "estadía" : "estadías"}{quote.stays.halfStays ? " + ½" : ""})</span>
                <span className="font-medium">{formatPrice(quote.parkingSubtotal)}</span>
              </div>
              {quote.transferCost > 0 && (
                <div className="flex justify-between text-brand-600">
                  <span>Traslado × {transferLegs}</span>
                  <span className="font-medium">{formatPrice(quote.transferCost)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-200 pt-2 text-base font-bold text-brand-900">
                <span>Total</span>
                <span>{formatPrice(quote.total)}</span>
              </div>
            </div>
          )}

          <textarea placeholder="Observaciones (opcional)" value={form.notes}
            onChange={e => updateField("notes", e.target.value)}
            className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm" rows={2} />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
            <p>Al confirmar serás redirigido a <strong>Mercado Pago</strong> para completar el pago de forma segura.</p>
          </div>

          <button type="submit" disabled={loading || !quote}
            className="w-full rounded-xl bg-brand-900 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50">
            {loading ? "Procesando..." : quote ? `Pagar ${formatPrice(quote.total)} con Mercado Pago` : "Completá las fechas"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReservarEzeizaPage() {
  return (
    <Suspense>
      <EzeizaContent />
    </Suspense>
  );
}
