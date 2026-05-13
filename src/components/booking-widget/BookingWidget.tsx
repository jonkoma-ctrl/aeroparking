"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Ship, Calendar, ArrowRight, Check, Clock, Sparkles, CreditCard, ExternalLink, Info, RotateCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { trackWidgetEvent } from "@/lib/analytics";
import { encodePrefill } from "@/lib/booking-prefill";
import type { Destino, ServiceType, QuoteResult } from "@/lib/pricing";

type Variant = "hero" | "compact" | "embedded";

interface Props {
  variant?: Variant;
  defaultDestino?: Destino;
  defaultServiceType?: ServiceType;
  entryPoint: string;
  className?: string;
  onQuoteCalculated?: (q: QuoteResult) => void;
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  aeroparque_drop_go: "Drop & Go — Aeroparque",
  aeroparque_larga_estadia: "Larga Estadía — Aeroparque",
  puerto_larga_estadia: "Estacionamiento — Puerto de BA",
  puerto_cruceros: "Cruceros — Puerto de BA",
  ezeiza_larga_estadia: "Larga Estadía — Ezeiza",
};

function formatStays(full: number, half: number): string {
  if (full === 0 && half === 1) return "½ estadía";
  if (half === 0) return `${full} ${full === 1 ? "estadía" : "estadías"}`;
  return `${full} ${full === 1 ? "estadía" : "estadías"} + ½`;
}

export function BookingWidget({
  variant = "hero",
  defaultDestino = "aeroparque",
  defaultServiceType,
  entryPoint,
  className = "",
  onQuoteCalculated,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"form" | "loading" | "result">("form");
  const [destino, setDestino] = useState<Destino>(defaultDestino);
  const [serviceType] = useState<ServiceType | "">(defaultServiceType || "");
  const [ingresoDate, setIngresoDate] = useState("");
  const [ingresoTime, setIngresoTime] = useState("10:00");
  const [retiroDate, setRetiroDate] = useState("");
  const [retiroTime, setRetiroTime] = useState("10:00");
  const [transferLegs, setTransferLegs] = useState<number>(2);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [alternatives, setAlternatives] = useState<QuoteResult[]>([]);
  const [error, setError] = useState("");
  const [showStaysInfo, setShowStaysInfo] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function markInteraction() {
    if (!hasInteracted) {
      trackWidgetEvent({ name: "quote_started", variant, entryPoint });
      setHasInteracted(true);
    }
  }

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!ingresoDate || !retiroDate) {
      setError("Completá las fechas de ingreso y retiro");
      return;
    }

    const ingreso = `${ingresoDate}T${ingresoTime}:00`;
    const retiro = `${retiroDate}T${retiroTime}:00`;

    if (new Date(retiro) <= new Date(ingreso)) {
      setError("La fecha y hora de retiro debe ser posterior al ingreso");
      return;
    }

    setPhase("loading");

    const params = new URLSearchParams({ destino, ingreso, retiro });
    if (serviceType) params.set("serviceType", serviceType);
    if (destino === "ezeiza") params.set("transferLegs", String(transferLegs));

    const res = await fetch(`/api/pricing/quote?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Error al calcular");
      setPhase("form");
      return;
    }

    const resultQuote: QuoteResult = data.quote || data.recommended;
    const alts: QuoteResult[] = data.alternatives || [];

    setQuote(resultQuote);
    setAlternatives(alts);
    setPhase("result");

    trackWidgetEvent({
      name: "quote_calculated",
      destino,
      serviceType: resultQuote.serviceType,
      days: resultQuote.days,
      total: resultQuote.total,
    });
    if (alts.length > 0) {
      trackWidgetEvent({
        name: "service_recommended",
        recommended: resultQuote.serviceType,
        alternatives: alts.map((a) => a.serviceType),
      });
    }
    onQuoteCalculated?.(resultQuote);
  }

  function handleBack() {
    setPhase("form");
    setError("");
  }

  function handleCTA(q: QuoteResult) {
    if (q.isReferencePrice && q.externalCheckoutUrl) {
      trackWidgetEvent({ name: "quote_cta_clicked", serviceType: q.serviceType, destination: "external" });
      trackWidgetEvent({ name: "redirected_external_checkout", serviceType: q.serviceType, url: q.externalCheckoutUrl });
      window.open(q.externalCheckoutUrl, "_blank", "noopener,noreferrer");
    } else {
      const ingreso = `${ingresoDate}T${ingresoTime}:00`;
      const retiro = `${retiroDate}T${retiroTime}:00`;
      const prefill = encodePrefill({ s: q.serviceType, i: ingreso, r: retiro });
      trackWidgetEvent({ name: "quote_cta_clicked", serviceType: q.serviceType, destination: "internal" });
      trackWidgetEvent({ name: "internal_checkout_started", serviceType: q.serviceType, prefillKeys: ["s", "i", "r"] });

      let target = "/reservar/puerto";
      if (q.serviceType === "puerto_cruceros") target = "/reservar/cruceros";
      if (q.serviceType === "ezeiza_larga_estadia") target = "/reservar/ezeiza";

      const params = new URLSearchParams({ prefill });
      if (q.serviceType === "ezeiza_larga_estadia") {
        params.set("legs", String(transferLegs));
      }
      router.push(`${target}?${params.toString()}`);
    }
  }

  const wrapperClass =
    variant === "hero"
      ? "rounded-2xl bg-white shadow-2xl border border-brand-100"
      : variant === "compact"
      ? "rounded-xl bg-white border border-brand-200"
      : "rounded-xl bg-brand-50 border border-brand-200";

  return (
    <>
      <section className={`${variant === "hero" ? "container-main px-4 -mt-12 relative z-20" : ""} ${className}`}>
        <div className={wrapperClass}>
          {phase === "form" && (
            <form onSubmit={handleCalculate} className="p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-500" />
                <h2 className="text-lg font-bold text-brand-900">Cotizá tu reserva al instante</h2>
              </div>

              {/* Destino pills */}
              <div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl bg-brand-100 p-1">
                <DestPill active={destino === "aeroparque"} onClick={() => { setDestino("aeroparque"); markInteraction(); }} icon={<Plane className="h-4 w-4" />} label="Aeroparque" />
                <DestPill active={destino === "puerto"} onClick={() => { setDestino("puerto"); markInteraction(); }} icon={<Ship className="h-4 w-4" />} label="Cruceros" />
                <DestPill active={destino === "ezeiza"} onClick={() => { setDestino("ezeiza"); markInteraction(); }} icon={<Plane className="h-4 w-4" />} label="Ezeiza" />
              </div>

              {/* Fechas + horas */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-500">
                    <Calendar className="mr-1 inline h-3.5 w-3.5" /> Ingreso
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={ingresoDate}
                      min={today}
                      onChange={(e) => { setIngresoDate(e.target.value); markInteraction(); }}
                      className="flex-1 rounded-lg border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={ingresoTime}
                      step={1800}
                      onChange={(e) => { setIngresoTime(e.target.value); markInteraction(); }}
                      className="w-24 rounded-lg border border-brand-200 px-2 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-500">
                    <Calendar className="mr-1 inline h-3.5 w-3.5" /> Retiro
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={retiroDate}
                      min={ingresoDate || today}
                      onChange={(e) => { setRetiroDate(e.target.value); markInteraction(); }}
                      className="flex-1 rounded-lg border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={retiroTime}
                      step={1800}
                      onChange={(e) => { setRetiroTime(e.target.value); markInteraction(); }}
                      className="w-24 rounded-lg border border-brand-200 px-2 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Info estadías */}
              <button
                type="button"
                onClick={() => setShowStaysInfo(!showStaysInfo)}
                className="mt-3 inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-700"
              >
                <Info className="h-3.5 w-3.5" /> ¿Cómo se cuentan las estadías?
              </button>
              {showStaysInfo && (
                <div className="mt-2 rounded-lg bg-brand-50 border border-brand-200 p-3 text-xs text-brand-700">
                  <strong>1 estadía = 24 horas.</strong> La primera estadía no se fracciona (mínimo $40.000 aunque dejes el auto pocas horas). Pasadas las 24h, cada bloque de hasta 12hs es ½ estadía ($20.000). Ej: 28hs = 1 estadía + ½ = $60.000.
                </div>
              )}

              {/* Traslado Ezeiza */}
              {destino === "ezeiza" && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="mb-2 text-xs font-medium text-amber-800">
                    ✈️ Traslado a Ezeiza ($40.000 por tramo, ~40 km)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: 0, l: "Sin traslado" },
                      { v: 1, l: "Solo ida" },
                      { v: 2, l: "Ida y vuelta" },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setTransferLegs(opt.v)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                          transferLegs === opt.v
                            ? "bg-amber-600 text-white"
                            : "bg-white text-amber-700 hover:bg-amber-100 border border-amber-300"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-5 w-full rounded-xl bg-brand-900 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-800 transition flex items-center justify-center gap-2"
              >
                Ver mi tarifa
                <ArrowRight className="h-4 w-4" />
              </button>

              <TrustBand />
            </form>
          )}

          {phase === "loading" && (
            <div className="p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-900" />
              <p className="mt-4 text-sm text-brand-500">Calculando tu mejor tarifa...</p>
            </div>
          )}

          {phase === "result" && quote && (
            <QuoteResultView
              quote={quote}
              alternatives={alternatives}
              onBack={handleBack}
              onCTA={handleCTA}
            />
          )}
        </div>
      </section>

      {/* Sticky mobile bar (solo en result) */}
      {phase === "result" && quote && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-brand-200 shadow-2xl p-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-brand-500">{formatStays(quote.fullStays, quote.halfStays)}</p>
              <p className="text-lg font-extrabold text-brand-900">{formatPrice(quote.total)}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCTA(quote)}
              className="rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-800 transition flex items-center gap-2"
            >
              {quote.isReferencePrice ? <>Reservar <ExternalLink className="h-4 w-4" /></> : <>Continuar <ArrowRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function DestPill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? "bg-white text-brand-900 shadow-sm" : "text-brand-500 hover:text-brand-700"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function TrustBand() {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-brand-500">
      <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-600" /> Bajo techo</span>
      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-green-600" /> Reserva en 30s</span>
      <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-green-600" /> Mercado Pago</span>
      <span className="flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5 text-green-600" /> Cancelación 24h gratis</span>
    </div>
  );
}

function QuoteResultView({
  quote,
  alternatives,
  onBack,
  onCTA,
}: {
  quote: QuoteResult;
  alternatives: QuoteResult[];
  onBack: () => void;
  onCTA: (q: QuoteResult) => void;
}) {
  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent-600">⭐ Tu mejor opción</p>
          <h3 className="mt-1 text-lg font-bold text-brand-900">{SERVICE_LABELS[quote.serviceType]}</h3>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
        >
          ← Modificar
        </button>
      </div>

      {/* Main price */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            {quote.discountPct > 0 && (
              <p className="text-sm text-brand-400 line-through">{formatPrice(quote.originalTotal)}</p>
            )}
            <p className="text-3xl md:text-4xl font-extrabold text-brand-900">{formatPrice(quote.total)}</p>
            <p className="text-sm text-brand-500 mt-1">
              {formatStays(quote.fullStays, quote.halfStays)} · {formatPrice(quote.pricePerStay)}/estadía
            </p>
          </div>
          {quote.discountPct > 0 && (
            <div className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
              -{quote.discountPct}% · Ahorrás {formatPrice(quote.savings)}
            </div>
          )}
        </div>

        {/* Breakdown */}
        <div className="mt-4 space-y-1.5 border-t border-brand-200 pt-3 text-sm">
          <div className="flex justify-between text-brand-600">
            <span>Cochera ({formatStays(quote.fullStays, quote.halfStays)})</span>
            <span className="font-medium">{formatPrice(quote.parkingSubtotal)}</span>
          </div>
          {quote.transferLegs > 0 && (
            <div className="flex justify-between text-brand-600">
              <span>Traslado × {quote.transferLegs} tramo{quote.transferLegs > 1 ? "s" : ""}</span>
              <span className="font-medium">{formatPrice(quote.transferSubtotal)}</span>
            </div>
          )}
          {quote.transferIncluded && (
            <p className="text-xs text-green-700 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Traslado incluido
            </p>
          )}
          {quote.discountPct > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Descuento</span>
              <span className="font-medium">-{formatPrice(quote.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-brand-200 pt-1.5 text-base font-bold text-brand-900">
            <span>Total</span>
            <span>{formatPrice(quote.total)}</span>
          </div>
        </div>

        {quote.isReferencePrice && (
          <p className="mt-3 text-xs text-brand-400 italic">
            * Precio estimado de referencia. La reserva y cobro se realizan en Aeropuertos Argentina.
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge icon="🅿️" text="Bajo techo · 24/7" />
        <Badge icon="🛡️" text="Seguro incluido" />
        <Badge icon="↻" text="Cancelación 24h gratis" />
        {!quote.isReferencePrice && <Badge icon="💳" text="Mercado Pago" />}
      </div>

      {/* CTA (oculto en mobile porque sticky lo reemplaza) */}
      <button
        type="button"
        onClick={() => onCTA(quote)}
        className="hidden md:flex mt-5 w-full rounded-xl bg-brand-900 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-800 transition items-center justify-center gap-2"
      >
        {quote.isReferencePrice ? (
          <>Reservar en AA2000 <ExternalLink className="h-4 w-4" /></>
        ) : (
          <>Continuar al pago <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="mt-5 border-t border-brand-100 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-500">También disponible</p>
          <div className="space-y-2">
            {alternatives.map((alt) => {
              const delta = alt.total - quote.total;
              return (
                <button
                  key={alt.serviceType}
                  type="button"
                  onClick={() => onCTA(alt)}
                  className="w-full flex items-center justify-between rounded-lg border border-brand-200 p-3 text-left hover:bg-brand-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-900">{SERVICE_LABELS[alt.serviceType]}</p>
                    <p className="text-xs text-brand-500">
                      {formatStays(alt.fullStays, alt.halfStays)} · {formatPrice(alt.pricePerStay)}/estadía
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-brand-900">{formatPrice(alt.total)}</p>
                    {delta !== 0 && (
                      <p className={`text-xs font-medium ${delta < 0 ? "text-green-700" : "text-brand-400"}`}>
                        {delta < 0 ? `−${formatPrice(Math.abs(delta))}` : `+${formatPrice(delta)}`}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <TrustBand />
    </div>
  );
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700">
      <span>{icon}</span> {text}
    </span>
  );
}
