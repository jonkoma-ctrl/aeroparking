"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Content() {
  const params = useSearchParams();
  const status = params.get("status");
  const reservationId = params.get("reservation");

  const isApproved = status === "approved";
  const isPending = status === "pending";
  const isRejected = status === "rejected" || status === "failure";

  return (
    <div className="section-padding">
      <div className="container-main max-w-lg text-center">
        {isApproved && (
          <>
            <div className="mb-4 text-5xl">✅</div>
            <h1 className="mb-2 text-2xl font-bold text-green-700">¡Pago confirmado!</h1>
            <p className="mb-6 text-brand-500">
              Tu reserva de Larga Estadía Cruceros fue confirmada. Te enviamos un email con los detalles.
            </p>
          </>
        )}
        {isPending && (
          <>
            <div className="mb-4 text-5xl">⏳</div>
            <h1 className="mb-2 text-2xl font-bold text-yellow-700">Pago pendiente</h1>
            <p className="mb-6 text-brand-500">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
          </>
        )}
        {isRejected && (
          <>
            <div className="mb-4 text-5xl">❌</div>
            <h1 className="mb-2 text-2xl font-bold text-red-700">Pago rechazado</h1>
            <p className="mb-6 text-brand-500">No pudimos procesar tu pago. Podés intentar de nuevo.</p>
            <Link href="/reservar/cruceros" className="inline-block rounded-lg bg-brand-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
              Intentar de nuevo
            </Link>
          </>
        )}

        {(isApproved || isPending) && reservationId && (
          <Link href={`/mi-reserva?id=${reservationId}`} className="inline-block rounded-lg bg-brand-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            Ver mi reserva
          </Link>
        )}

        <div className="mt-8">
          <Link href="/" className="text-sm text-brand-500 hover:text-brand-700">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  return <Suspense><Content /></Suspense>;
}
