import { notFound } from "next/navigation";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, getStatusLabel, getStatusColor } from "@/lib/utils";
import { AdminStatusButton } from "../AdminStatusButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Admin — Detalle Crucero — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

export default async function CruiseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await prisma.cruiseReservation.findUnique({ where: { id } });
  if (!r) notFound();

  return (
    <div className="section-padding">
      <div className="container-main max-w-2xl">
        <div className="mb-6">
          <Link href="/admin/agenda" className="text-sm text-brand-500 hover:text-brand-700">
            ← Volver a Agenda
          </Link>
        </div>

        <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-brand-900">
                Reserva Cruceros
              </h1>
              <p className="mt-1 text-sm text-brand-500">
                Creado {formatDateTime(r.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(r.status)}`}>
                {getStatusLabel(r.status)}
              </span>
              <AdminStatusButton reservationId={r.id} currentStatus={r.status} />
            </div>
          </div>

          <div className="mb-6">
            <span className="inline-flex rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-700">
              Cruceros — Puerto de BA
            </span>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">Cliente</h2>
              <dl className="space-y-2 text-sm">
                <Row label="Nombre" value={`${r.firstName} ${r.lastName}`} />
                <Row label="Email" value={r.email} />
                <Row label="Teléfono" value={r.phone} />
              </dl>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">Viaje</h2>
              <dl className="space-y-2 text-sm">
                <Row label="Embarque" value={`${formatDate(r.departureDate)} — ${r.arrivalTime} hs`} />
                <Row label="Desembarque" value={`${formatDate(r.returnDate)} — ${r.pickupTime} hs`} />
                <Row label="Pasajeros" value={String(r.passengers)} />
                {r.cruiseLine && <Row label="Naviera" value={r.cruiseLine} />}
                {r.terminal && <Row label="Terminal" value={r.terminal} />}
              </dl>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">Vehículo</h2>
              <dl className="space-y-2 text-sm">
                <Row label="Patente" value={r.licensePlate} />
                <Row label="Marca" value={r.carBrand} />
                <Row label="Modelo" value={r.carModel} />
              </dl>
            </section>

            {r.notes && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-400">Notas</h2>
                <p className="whitespace-pre-wrap rounded-lg bg-brand-50 p-3 text-sm text-brand-700">{r.notes}</p>
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
