import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  formatDate,
  formatDateTime,
  getStatusLabel,
  getStatusColor,
  getServiceTypeLabel,
  formatPrice,
} from "@/lib/utils";
import { AeroparqueStatusButton } from "../AeroparqueStatusButton";

export const metadata: Metadata = {
  title: `Admin — Detalle Reserva — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const reservation = await prisma.aeroparqueReservation.findUnique({
    where: { id },
  });

  if (!reservation) notFound();

  const r = reservation;

  return (
    <div className="section-padding">
      <div className="container-main max-w-2xl">
        <div className="mb-6">
          <Link
            href="/admin/agenda"
            className="text-sm text-brand-500 hover:text-brand-700"
          >
            ← Volver a Agenda
          </Link>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-brand-900">
                Pedido #{r.externalOrderId}
              </h1>
              <p className="mt-1 text-sm text-brand-500">
                Creado {formatDateTime(r.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(r.status)}`}
              >
                {getStatusLabel(r.status)}
              </span>
              <AeroparqueStatusButton reservationId={r.id} currentStatus={r.status} />
            </div>
          </div>

          {/* Badges */}
          <div className="mb-6 flex gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                r.destination === "aeroparque"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-cyan-100 text-cyan-700"
              }`}
            >
              {r.destination === "aeroparque" ? "Aeroparque" : "Puerto de BA"}
            </span>
            <span className="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              {getServiceTypeLabel(r.serviceType)}
            </span>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Cliente */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">
                Cliente
              </h2>
              <dl className="space-y-2 text-sm">
                <Row label="Nombre" value={r.customerName} />
                {r.email && <Row label="Email" value={r.email} />}
                {r.phone && <Row label="Teléfono" value={r.phone} />}
                {r.dni && <Row label="DNI" value={r.dni} />}
              </dl>
            </section>

            {/* Vehículo */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">
                Vehículo
              </h2>
              <dl className="space-y-2 text-sm">
                <Row label="Patente" value={r.licensePlate} />
                <Row label="Marca" value={r.carBrand} />
                <Row label="Modelo" value={r.carModel} />
              </dl>
            </section>

            {/* Reserva */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">
                Reserva
              </h2>
              <dl className="space-y-2 text-sm">
                <Row
                  label="Ingreso"
                  value={`${formatDate(r.startDate)}${r.checkInTime ? ` — ${r.checkInTime} hs` : ""}`}
                />
                <Row
                  label="Retiro"
                  value={`${formatDate(r.endDate)}${r.arrivalTime ? ` — ${r.arrivalTime} hs` : ""}`}
                />
                <Row label="Precio" value={formatPrice(r.price)} />
                {r.passengers && <Row label="Pasajeros" value={String(r.passengers)} />}
              </dl>
            </section>

            {/* Vuelos */}
            {(r.departureAirline || r.departureFlight || r.arrivalAirline || r.arrivalFlight) && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">
                  Vuelos
                </h2>
                <dl className="space-y-2 text-sm">
                  {(r.departureAirline || r.departureFlight) && (
                    <Row
                      label="Salida"
                      value={`${[r.departureAirline, r.departureFlight].filter(Boolean).join(" ")}${r.departureFlightDate ? ` — ${formatDate(r.departureFlightDate)}` : ""}`}
                    />
                  )}
                  {(r.arrivalAirline || r.arrivalFlight) && (
                    <Row
                      label="Arribo"
                      value={`${[r.arrivalAirline, r.arrivalFlight].filter(Boolean).join(" ")}${r.arrivalTime ? ` — ${r.arrivalTime} hs` : ""}`}
                    />
                  )}
                </dl>
              </section>
            )}

            {/* Notas */}
            {r.notes && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">
                  Notas
                </h2>
                <p className="whitespace-pre-wrap rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
                  {r.notes}
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-brand-500">{label}</dt>
      <dd className="font-medium text-brand-900">{value}</dd>
    </div>
  );
}
