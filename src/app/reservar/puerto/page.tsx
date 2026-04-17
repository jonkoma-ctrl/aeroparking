"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { decodePrefill } from "@/lib/booking-prefill";

function PuertoContent() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    licensePlate: "", carBrand: "", carModel: "",
    startDate: "", endDate: "", passengers: "1", notes: "",
  });
  const [quote, setQuote] = useState<{ days: number; pricePerDay: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill from URL query (?prefill=base64url)
  useEffect(() => {
    const encoded = searchParams.get("prefill");
    if (!encoded) return;
    const payload = decodePrefill(encoded);
    if (!payload) return;
    const startDate = new Date(payload.i).toISOString().split("T")[0];
    const endDate = new Date(payload.r).toISOString().split("T")[0];
    setForm((f) => ({ ...f, startDate, endDate }));
    // Trigger quote calculation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      fetch("/api/admin/pricing").then(r => r.json()).then(pricing => {
        const tariff = pricing.find((p: { destination: string; serviceType: string; active: boolean }) =>
          p.destination === "puerto" && p.serviceType === "larga_estadia" && p.active
        );
        if (tariff) setQuote({ days, pricePerDay: tariff.pricePerDay, total: days * tariff.pricePerDay });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(field: string, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);

    // Recalculate quote when dates change
    if ((field === "startDate" || field === "endDate") && updated.startDate && updated.endDate) {
      const start = new Date(updated.startDate);
      const end = new Date(updated.endDate);
      const diffMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (days > 0) {
        // Fetch current pricing
        fetch("/api/admin/pricing")
          .then(r => r.json())
          .then(pricing => {
            const tariff = pricing.find((p: { destination: string; serviceType: string; active: boolean }) =>
              p.destination === "puerto" && p.serviceType === "larga_estadia" && p.active
            );
            if (tariff) {
              setQuote({ days, pricePerDay: tariff.pricePerDay, total: days * tariff.pricePerDay });
            }
          });
      } else {
        setQuote(null);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok && data.initPoint) {
      // Redirect to Mercado Pago
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
          Reservar — Puerto de Buenos Aires
        </h1>
        <p className="mb-8 text-sm text-brand-500">
          Estacionamiento en Costa Salguero con traslado al Puerto de Buenos Aires.
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

          {/* Fechas */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-2">
              Fechas
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-brand-500 mb-1">Ingreso</label>
                <input required type="date" value={form.startDate} min={today}
                  onChange={e => updateField("startDate", e.target.value)}
                  className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-brand-500 mb-1">Retiro</label>
                <input required type="date" value={form.endDate} min={form.startDate || today}
                  onChange={e => updateField("endDate", e.target.value)}
                  className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm" />
              </div>
            </div>
          </fieldset>

          {/* Quote */}
          {quote && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-brand-500">Tarifa por día</span>
                <span className="text-sm font-medium text-brand-900">{formatPrice(quote.pricePerDay)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-brand-500">Días</span>
                <span className="text-sm font-medium text-brand-900">{quote.days}</span>
              </div>
              <div className="flex items-center justify-between border-t border-brand-200 pt-2">
                <span className="font-semibold text-brand-900">Total</span>
                <span className="text-lg font-bold text-brand-900">{formatPrice(quote.total)}</span>
              </div>
            </div>
          )}

          {/* Notas */}
          <textarea placeholder="Observaciones (opcional)" value={form.notes}
            onChange={e => updateField("notes", e.target.value)}
            className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm" rows={2} />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
            <p>Al confirmar serás redirigido a <strong>Mercado Pago</strong> para completar el pago de forma segura.</p>
          </div>

          <button
            type="submit"
            disabled={loading || !quote}
            className="w-full rounded-xl bg-brand-900 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {loading ? "Procesando..." : quote ? `Pagar ${formatPrice(quote.total)} con Mercado Pago` : "Seleccioná las fechas"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ReservarPuertoPage() {
  return (
    <Suspense>
      <PuertoContent />
    </Suspense>
  );
}
