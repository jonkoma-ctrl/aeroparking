import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Mercado Pago de Border's Parking SRL.
 *
 * Es la misma cuenta (y por ahora la misma aplicación) que usa el sitio de
 * BA Ferial. Esa aplicación tiene su aviso de pago configurado en el panel de
 * MP apuntando al sitio de BA Ferial, así que acá mandamos `notification_url`
 * en cada cobro: para estos pagos tiene prioridad sobre el panel y el aviso
 * llega a este sitio.
 */
export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
  options: { timeout: 8000 },
});

/** Prefijo de external_reference: separa nuestros pagos de los de BA Ferial. */
export const KP_REF_PREFIX = "kp:";

/** Minutos que se guarda la reserva esperando el pago. */
export const PAYMENT_WINDOW_MIN = 30;

/** Estados de una reserva que todavía no está paga (no cuenta como reserva). */
export const UNPAID_STATUSES = [
  "pending_payment",
  "payment_rejected",
  "payment_expired",
] as const;

// Instante → ISO con offset de Argentina (UTC-3 fijo), formato que acepta MP.
export function isoAR(d: Date): string {
  const ar = new Date(d.getTime() - 3 * 3600 * 1000);
  return ar.toISOString().replace("Z", "-03:00");
}

export async function createReservationPreference(input: {
  reservationId: string;
  code: string;
  title: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  expiresAt: Date;
}): Promise<{ preferenceId: string | null; initPoint: string }> {
  const base = getSiteUrl();
  const back = `${base}/reservar/resultado?r=${input.reservationId}`;
  const pref = await new Preference(mp).create({
    body: {
      items: [
        {
          id: input.code,
          title: input.title,
          quantity: 1,
          unit_price: input.amount,
          currency_id: "ARS",
        },
      ],
      payer: { name: input.payerName, email: input.payerEmail },
      external_reference: `${KP_REF_PREFIX}${input.reservationId}`,
      notification_url: `${base}/api/payments/webhook`,
      back_urls: { success: back, failure: back, pending: back },
      ...(base.startsWith("https://") ? { auto_return: "approved" as const } : {}),
      binary_mode: true, // aprobado o rechazado al instante
      expires: true,
      expiration_date_from: isoAR(new Date()),
      expiration_date_to: isoAR(input.expiresAt),
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }, { id: "atm" }], // sin efectivo
      },
      statement_descriptor: "KINGPARK",
    },
  });
  if (!pref.init_point) throw new Error("Mercado Pago no devolvió el link de pago");
  return { preferenceId: pref.id ?? null, initPoint: pref.init_point };
}
