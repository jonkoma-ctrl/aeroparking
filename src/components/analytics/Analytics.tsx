"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { captureAttribution, clearAttribution } from "@/lib/attribution";
import { trackWhatsappClick } from "@/lib/analytics";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
const CONSENT_KEY = "kp_cookies";

/**
 * Pantallas sin medición: el panel, la validación del QR y Mi reserva (su link
 * lleva un token de acceso que no puede salir hacia Google ni Meta).
 */
const PRIVATE_PATHS = ["/admin", "/validar", "/mi-reserva"];

type Consent = "accepted" | "rejected" | null;

function readConsent(): Consent {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

function saveConsent(value: "accepted" | "rejected") {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Sin almacenamiento: el aviso vuelve a aparecer en la próxima visita.
  }
}

export function Analytics() {
  const pathname = usePathname() || "/";
  const isPrivate = PRIVATE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const enabled = /^GTM-[A-Z0-9]+$/.test(GTM_ID);

  const [consent, setConsent] = useState<Consent | "loading">("loading");

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  // Si se llega a una pantalla privada navegando dentro del sitio, se recarga
  // para que la etiqueta ya cargada no lea esa URL.
  useEffect(() => {
    if (isPrivate && window.kpTagLoaded) window.location.reload();
  }, [isPrivate]);

  useEffect(() => {
    if (consent === "loading" || consent === "rejected" || isPrivate) return;
    captureAttribution(window.location.search);
  }, [consent, isPrivate, pathname]);

  // Un solo escucha cubre todos los links a WhatsApp del sitio.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) {
        trackWhatsappClick(window.location.pathname);
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!enabled || isPrivate || consent === "loading") return null;

  function reject() {
    saveConsent("rejected");
    clearAttribution();
    // Recarga para que las etiquetas ya cargadas dejen de correr.
    window.location.reload();
  }

  function accept() {
    saveConsent("accepted");
    setConsent("accepted");
  }

  return (
    <>
      {consent !== "rejected" && (
        <Script id="gtm" strategy="afterInteractive">
          {`window.kpTagLoaded=true;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}

      {consent === null && (
        <div
          role="region"
          aria-label="Aviso de cookies"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl bg-white p-4 shadow-elevated ring-1 ring-brand-100 print:hidden sm:flex sm:items-center sm:gap-4"
        >
          <p className="text-sm text-brand-700">
            Usamos cookies para medir las visitas y nuestros anuncios.{" "}
            <Link href="/privacidad" className="font-semibold text-brand-600 underline underline-offset-2">
              Ver privacidad
            </Link>
          </p>
          <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
            <button
              type="button"
              onClick={reject}
              className="flex-1 rounded-full px-4 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50 sm:flex-none"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={accept}
              className="flex-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:flex-none"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
