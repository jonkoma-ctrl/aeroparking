"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane, Ship, Calendar, ArrowRight, Check, Clock, Sparkles, CreditCard, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { trackWidgetEvent } from "@/lib/analytics";
import { encodePrefill } from "@/lib/booking-prefill";
import type { Destino, ServiceType, QuoteResult, DurationDiscount } from "@/lib/pricing";

type Variant = "hero" | "compact" | "embedded";

interface Props {
  variant?: Variant;
  defaultDestino?: Destino;
  defaultServiceType?: ServiceType;
  entryPoint: string;
  className?: string;
  onQuoteCalculated?: (q: QuoteResult) => void;
}

export function BookingWidget({
  variant = "hero",
  defaultDestino = "puerto",
  defaultServiceType,
  entryPoint,
  className = "",
  onQuoteCalculated,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"form" | "loading" | "result">("form");
  const [destino, setDestino] = useState<Destino>(defaultDestino);
  const [serviceType, setServiceType] = useState<ServiceType | "">(defaultServiceType || "");
  const [ingreso, setIngreso] = useState("");
  const [retiro, setRetiro] = useState("");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [alternatives, setAlternatives] = useState<QuoteResult[]>([]);
  const [error, setError] = useState("");
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
    if (!ingreso || !retiro) {
      setError("Completá las fechas de ingreso y retiro");
      return;
    }

    setPhase("loading");

    const params = new URLSearchParams({ destino, ingreso, retiro });
    if (serviceType) params.set("serviceType", serviceType);

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
      const prefill = encodePrefill({ s: q.serviceType, i: ingreso, r: retiro });
      trackWidgetEvent({ name: "quote_cta_clicked", serviceType: q.serviceType, destination: "internal" });
      trackWidgetEvent({ name: "internal_checkout_started", serviceType: q.serviceType, prefillKeys: ["s", "i", "r"] });
      router.push(`/reservar/puerto?prefill=${prefill}`);
    }
  }

  const wrapperClass =
    variant === "hero"
      ? "rounded-2xl bg-white shadow-2xl border border-brand-100"
      : variant === "compact"
      ? "rounded-xl bg-white border border-brand-200"
      : "rounded-xl bg-brand-50 border border-brand-200";

  return (
    <section className={`${variant === "hero" ? "container-main px-4 -mt-12 relative z-20" : ""} ${className}`}>
      <div className={wrapperClass}>
        {phase === "form" && (
          <form onSubmit={handleCalculate} className="p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-500" />
              <h2 className="text-lg font-bold text-brand-900">Cotizá tu reserva al instante</h2>
            </div>

            {/* Destino pills */}
            <div className="mb-5 inline-flex gap-1 rounded-xl bg-brand-100 p-1">
              <button
                type="button"
                onClick={() => { setDestino("aeroparque"); setServiceType(""); markInteraction(); }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  destino === "aeroparque" ? "bg-white text-brand-900 shadow-sm" : "text-brand-500 hover:text-brand-700"
                }`}
              >
                <Plane className="h-4 w-4" /> Aeroparque
              </button>
              <button
                type="button"
                onClick={() => { setDestino("puerto"); setServiceType(""); markInteraction(); }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  destino === "puerto" ? "bg-white text-brand-900 shadow-sm" : "text-brand-500 hover:text-brand-700"
                }`}
              >
                <Ship className="h-4 w-4" /> Puerto de BA
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-500">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" /> Ingreso
                </label>
                <input
                  type="date"
                  value={ingreso}
                  min={today}
                  onChange={(e) => { setIngreso(e.target.value); markInteraction(); }}
                  className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-500">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" /> Retiro
                </label>
                <input
                  type="date"
                  value={retiro}
                  min={ingreso || today}
                  onChange={(e) => { setRetiro(e.target.value); markInteraction(); }}
                  className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-brand-900 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-800 transition flex items-center justify-center gap-2"
            >
              Calcular tarifa
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-brand-500">
              <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5 text-green-600" /> Traslado incluido</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-green-600" /> Reserva en 2 min</span>
              <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5 text-green-600" /> Mercado Pago</span>
            </div>
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
  );
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  aeroparque_drop_go: "Drop & Go — Aeroparque",
  aeroparque_larga_estadia: "Larga Estadía — Aeroparque",
  puerto_larga_estadia: "Estacionamiento — Puerto de BA",
  puerto_cruceros: "Cruceros — Puerto de BA",
};

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
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-500">
            Tarifa recomendada
          </p>
          <h3 className="mt-1 text-lg font-bold text-brand-900">
            {SERVICE_LABELS[quote.serviceType]}
          </h3>
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
              <p className="text-sm text-brand-400 line-through">
                {formatPrice(quote.originalTotal)}
              </p>
            )}
            <p className="text-3xl md:text-4xl font-extrabold text-brand-900">
              {formatPrice(quote.total)}
            </p>
            <p className="text-sm text-brand-500 mt-1">
              {quote.days} día{quote.days !== 1 ? "s" : ""} · {formatPrice(quote.pricePerDay)}/día
            </p>
          </div>
          {quote.discountPct > 0 && (
            <div className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
              -{quote.discountPct}% · Ahorrás {formatPrice(quote.savings)}
            </div>
          )}
        </div>

        {quote.isReferencePrice && (
          <p className="mt-3 text-xs text-brand-400 italic">
            * Precio estimado de referencia. La reserva y cobro se realizan en Aeropuertos Argentina.
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge icon="🏆" text="Mejor tarifa online" />
        <Badge icon="🚐" text="Traslado incluido" />
        <Badge icon="⚡" text="Reserva rápida" />
        {!quote.isReferencePrice && <Badge icon="💳" text="Mercado Pago" />}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onCTA(quote)}
        className="mt-5 w-full rounded-xl bg-brand-900 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-brand-800 transition flex items-center justify-center gap-2"
      >
        {quote.isReferencePrice ? (
          <>Reservar en Aeropuertos Argentina <ExternalLink className="h-4 w-4" /></>
        ) : (
          <>Continuar con la reserva <ArrowRight className="h-4 w-4" /></>
        )}
      </button>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="mt-5 border-t border-brand-100 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-brand-500">
            También disponible
          </p>
          <div className="space-y-2">
            {alternatives.map((alt) => (
              <button
                key={alt.serviceType}
                type="button"
                onClick={() => onCTA(alt)}
                className="w-full flex items-center justify-between rounded-lg border border-brand-200 p-3 text-left hover:bg-brand-50 transition"
              >
                <div>
                  <p className="text-sm font-medium text-brand-900">
                    {SERVICE_LABELS[alt.serviceType]}
                  </p>
                  <p className="text-xs text-brand-500">
                    {alt.days} día{alt.days !== 1 ? "s" : ""} · {formatPrice(alt.pricePerDay)}/día
                  </p>
                </div>
                <p className="text-lg font-bold text-brand-900">{formatPrice(alt.total)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
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
