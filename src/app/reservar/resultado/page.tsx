import type { Metadata } from "next";
import Link from "next/link";
import { Payment } from "mercadopago";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { mp, KP_REF_PREFIX } from "@/lib/mp";
import { applyReservationPayment } from "@/lib/reservation-payment";
import { BRAND_NAME, CONTACT } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { RetryPayButton } from "./RetryPayButton";

export const metadata: Metadata = {
  title: `Tu reserva — ${BRAND_NAME}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ r?: string; payment_id?: string; collection_id?: string }>;
}

export default async function ResultadoPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const id = sp.r || "";
  const paymentId = sp.payment_id || sp.collection_id || "";

  let reservation = id
    ? await prisma.aeroparqueReservation.findUnique({ where: { id } })
    : null;

  // Respaldo del webhook: si volvemos de MP con un pago y la reserva sigue
  // pendiente, consultamos el pago real y lo aplicamos acá mismo.
  if (reservation && paymentId && reservation.status !== "confirmed") {
    try {
      const pago = await new Payment(mp).get({ id: paymentId });
      if (pago.external_reference === `${KP_REF_PREFIX}${reservation.id}`) {
        await applyReservationPayment(pago);
        reservation = await prisma.aeroparqueReservation.findUnique({ where: { id } });
      }
    } catch (err) {
      console.error("[reservar/resultado] no se pudo consultar el pago:", err);
    }
  }

  if (!reservation) {
    return (
      <Shell>
        <Icon tone="red"><XCircle className="h-9 w-9 text-red-600" /></Icon>
        <h1 className="text-center text-2xl font-extrabold text-brand-900">No encontramos la reserva</h1>
        <p className="mt-3 text-center text-brand-600">
          Si pagaste y no te llegó el mail, escribinos por WhatsApp y lo resolvemos.
        </p>
        <Help />
      </Shell>
    );
  }

  const paid = ["confirmed", "checked_in", "completed"].includes(reservation.status);
  const review = reservation.status === "payment_review";
  const failed = ["payment_rejected", "payment_expired"].includes(reservation.status);

  return (
    <Shell>
      {paid && (
        <>
          <Icon tone="green"><CheckCircle2 className="h-9 w-9 text-green-600" /></Icon>
          <h1 className="text-center text-3xl font-extrabold text-brand-900">¡Reserva confirmada!</h1>
          <p className="mt-3 text-center text-brand-600">
            Recibimos tu pago{reservation.paidAmount ? ` de ${formatPrice(reservation.paidAmount)}` : ""}. Te
            mandamos el mail con tu código QR a <strong className="text-brand-900">{reservation.email}</strong>.
          </p>
        </>
      )}
      {review && (
        <>
          <Icon tone="amber"><Clock className="h-9 w-9 text-amber-600" /></Icon>
          <h1 className="text-center text-2xl font-extrabold text-brand-900">Recibimos tu pago</h1>
          <p className="mt-3 text-center text-brand-600">
            Lo estamos revisando y te escribimos a la brevedad para confirmar tu reserva.
          </p>
        </>
      )}
      {failed && (
        <>
          <Icon tone="red"><XCircle className="h-9 w-9 text-red-600" /></Icon>
          <h1 className="text-center text-2xl font-extrabold text-brand-900">El pago no se completó</h1>
          <p className="mt-3 text-center text-brand-600">
            No se te cobró nada. Podés intentarlo de nuevo con otra tarjeta o medio de pago.
          </p>
          <div className="mt-6"><RetryPayButton reservationId={reservation.id} /></div>
        </>
      )}
      {reservation.status === "pending_payment" && (
        <>
          <Icon tone="amber"><Clock className="h-9 w-9 text-amber-600" /></Icon>
          <h1 className="text-center text-2xl font-extrabold text-brand-900">Esperando la confirmación del pago</h1>
          <p className="mt-3 text-center text-brand-600">
            Si ya pagaste, en unos minutos te llega el mail con tu QR. Si no llegaste a pagar, podés hacerlo ahora.
          </p>
          <div className="mt-6"><RetryPayButton reservationId={reservation.id} /></div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Código de reserva</p>
        <p className="mt-2 text-3xl font-extrabold tracking-widest text-brand-900">{reservation.externalOrderId}</p>
      </div>

      {paid && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/mi-reserva?order=${reservation.externalOrderId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Ver mi reserva <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Volver al inicio
          </Link>
        </div>
      )}
      <Help />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[80vh] bg-brand-50 py-12 sm:py-20">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-lg sm:p-12">{children}</div>
      </div>
    </main>
  );
}

function Icon({ tone, children }: { tone: "green" | "amber" | "red"; children: React.ReactNode }) {
  const bg = tone === "green" ? "bg-green-100" : tone === "amber" ? "bg-amber-100" : "bg-red-100";
  return <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${bg}`}>{children}</div>;
}

function Help() {
  return (
    <div className="mt-6 border-t border-brand-100 pt-6 text-center text-xs text-brand-500">
      ¿Necesitás ayuda?{" "}
      <a href={`https://wa.me/${CONTACT.whatsapp}`} className="font-semibold text-brand-700 hover:underline">
        WhatsApp {CONTACT.phone}
      </a>
    </div>
  );
}
