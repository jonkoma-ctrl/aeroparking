import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: `Reserva confirmada — ${BRAND_NAME}`,
};

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  if (!params.id) {
    notFound();
  }

  const reservation = await prisma.cruiseReservation.findUnique({
    where: { id: params.id },
  });

  if (!reservation) {
    notFound();
  }

  return (
    <div className="section-padding">
      <div className="container-main max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-brand-900">
          Reserva recibida
        </h1>
        <p className="mt-3 text-lg text-brand-500">
          Tu solicitud fue registrada exitosamente. Nuestro equipo la revisará
          y te contactará para confirmar.
        </p>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-6 text-left md:p-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500">
            Resumen de la reserva
          </h2>

          <dl className="space-y-3 text-sm">
            <SummaryRow label="Código de reserva" value={reservation.id} />
            <SummaryRow label="Estado" value="Pendiente de confirmación" />
            <SummaryRow
              label="Nombre"
              value={`${reservation.firstName} ${reservation.lastName}`}
            />
            <SummaryRow label="Email" value={reservation.email} />
            <SummaryRow label="Teléfono" value={reservation.phone} />
            <div className="border-t border-brand-200 pt-3" />
            <SummaryRow
              label="Fecha de salida"
              value={formatDate(reservation.departureDate)}
            />
            <SummaryRow
              label="Llegada al parking"
              value={reservation.arrivalTime}
            />
            <SummaryRow
              label="Fecha de regreso"
              value={formatDate(reservation.returnDate)}
            />
            <SummaryRow
              label="Retiro del auto"
              value={reservation.pickupTime}
            />
            <SummaryRow
              label="Pasajeros"
              value={String(reservation.passengers)}
            />
            <div className="border-t border-brand-200 pt-3" />
            <SummaryRow label="Patente" value={reservation.licensePlate} />
            <SummaryRow
              label="Vehículo"
              value={`${reservation.carBrand} ${reservation.carModel}`}
            />
            {reservation.cruiseLine && (
              <SummaryRow label="Naviera" value={reservation.cruiseLine} />
            )}
            {reservation.terminal && (
              <SummaryRow label="Terminal" value={reservation.terminal} />
            )}
            {reservation.notes && (
              <SummaryRow label="Observaciones" value={reservation.notes} />
            )}
          </dl>
        </div>

        <div className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Te enviaremos un email de confirmación a{" "}
          <strong>{reservation.email}</strong> una vez que la reserva sea
          aprobada por nuestro equipo.
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brand-500">{label}</dt>
      <dd className="text-right font-medium text-brand-900">{value}</dd>
    </div>
  );
}
