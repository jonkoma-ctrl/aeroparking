"use client";

import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react";

type EmbedState = "loading" | "embedded" | "blocked";

interface ExternalBookingSectionProps {
  externalUrl: string;
  serviceName: string;
  /** Content shown when iframe is blocked (fallback) */
  fallbackContent: React.ReactNode;
}

/**
 * Generic component for integrating external booking services.
 *
 * Strategy 1 — EMBED: tries to load the external URL in an iframe.
 * Strategy 2 — FALLBACK: if the iframe is blocked (X-Frame-Options, CSP),
 * displays a rich fallback with service info + CTA to open in new tab.
 *
 * Detection: uses a combination of iframe onLoad/onError events and a
 * timeout-based heuristic. Most sites blocking iframes will trigger an
 * error or the iframe will remain blank after a timeout.
 */
export function ExternalBookingSection({
  externalUrl,
  serviceName,
  fallbackContent,
}: ExternalBookingSectionProps) {
  const [embedState, setEmbedState] = useState<EmbedState>("loading");

  const handleIframeLoad = useCallback(() => {
    // If the iframe loads, it might be showing an error page or the actual content.
    // We can't reliably detect X-Frame-Options blocks from JS, so we use a
    // conservative approach: assume blocked and show fallback.
    // In production, test with the actual URLs and flip to "embedded" if they work.
  }, []);

  useEffect(() => {
    // Most sites serving X-Frame-Options: DENY or SAMEORIGIN will cause the
    // iframe to show a blank page or error. We default to fallback-first
    // since AA2000's tienda likely blocks iframes.
    //
    // To test: change the timeout behavior or set an env flag.
    const timer = setTimeout(() => {
      setEmbedState("blocked");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // --- LOADING STATE ---
  if (embedState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="mt-4 text-sm text-brand-500">
          Cargando sistema de reservas...
        </p>
        {/* Hidden iframe for detection */}
        <iframe
          src={externalUrl}
          className="hidden"
          onLoad={handleIframeLoad}
          onError={() => setEmbedState("blocked")}
          sandbox="allow-same-origin"
          title={`Verificación de ${serviceName}`}
        />
      </div>
    );
  }

  // --- EMBEDDED STATE ---
  if (embedState === "embedded") {
    return (
      <div className="overflow-hidden rounded-2xl border border-brand-100">
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-4 py-3">
          <span className="text-sm font-medium text-brand-700">
            Sistema de reservas — {serviceName}
          </span>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-700"
          >
            Abrir en nueva pestaña
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <iframe
          src={externalUrl}
          className="h-[700px] w-full"
          title={`Reservas ${serviceName}`}
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
  }

  // --- BLOCKED / FALLBACK STATE ---
  return (
    <div className="rounded-2xl border border-brand-100 bg-white">
      {/* Fallback header */}
      <div className="flex items-center gap-3 border-b border-brand-100 bg-brand-50 px-6 py-4">
        <AlertTriangle className="h-4 w-4 text-accent-600" />
        <p className="text-sm text-brand-600">
          La reserva se completa en el sistema oficial de Aeropuertos Argentina
        </p>
      </div>

      {/* Rich fallback content */}
      <div className="p-6 md:p-8">{fallbackContent}</div>

      {/* CTA */}
      <div className="border-t border-brand-100 bg-brand-50 px-6 py-5">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-brand-500">
            Serás redirigido al sistema oficial para completar tu reserva.
          </p>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 sm:w-auto"
          >
            Continuar reserva
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
