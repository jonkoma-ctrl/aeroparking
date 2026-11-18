import type { Destino, ServiceType } from "./pricing";

export type WidgetEvent =
  | { name: "quote_started"; variant: string; entryPoint: string }
  | { name: "quote_calculated"; destino: Destino; serviceType: ServiceType; days: number; total: number }
  | { name: "service_recommended"; recommended: ServiceType; alternatives: ServiceType[] }
  | { name: "quote_cta_clicked"; serviceType: ServiceType; destination: "internal" | "external" }
  | { name: "redirected_external_checkout"; serviceType: ServiceType; url: string }
  | { name: "internal_checkout_started"; serviceType: ServiceType; prefillKeys: string[] };

function getFunnelId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem("aeroparking_funnel_id");
    if (!id) {
      id = `fn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem("aeroparking_funnel_id", id);
    }
    return id;
  } catch {
    return "";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { dataLayer?: any[]; kpTagLoaded?: boolean; } }

export function trackWidgetEvent(event: WidgetEvent): void {
  if (typeof window === "undefined") return;

  const payload = {
    event: event.name,
    funnelId: getFunnelId(),
    timestamp: Date.now(),
    ...event,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload);
  }
}

export interface PurchaseData {
  /** Código de la reserva (KP-…): evita contar dos veces la misma compra. */
  transactionId: string;
  value: number;
  destination: string;
  serviceType: string;
}

/** Reserva pagada: la conversión principal. No lleva datos personales. */
export function trackPurchase(data: PurchaseData): void {
  if (typeof window === "undefined") return;
  const sentKey = `kp_purchase_${data.transactionId}`;
  try {
    if (localStorage.getItem(sentKey)) return;
    localStorage.setItem(sentKey, "1");
  } catch {
    // Sin almacenamiento, GA4 igual descarta el repetido por transaction_id.
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: data.transactionId,
      value: data.value,
      currency: "ARS",
      items: [
        {
          item_id: `${data.destination}_${data.serviceType}`,
          item_name: data.destination === "puerto" ? "Estacionamiento Cruceros" : "Estacionamiento Aeroparque",
          price: data.value,
          quantity: 1,
        },
      ],
    },
  });
}

export function trackWhatsappClick(page: string): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "whatsapp_click", page });
}
