import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  formatDate,
  formatCurrency,
  getStatusLabel,
  getStatusColor,
  getPaymentLabel,
  getPaymentColor,
  getServiceLabel,
  getServiceColor,
} from "@/lib/utils";
import { AeroparqueStatusButton } from "./AeroparqueStatusButton";
import { AgendaFilters } from "./AgendaFilters";
import { Plane, Ship, Car, DollarSign, Users, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: `Agenda de Ingresos — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterService = params.service; // drop_go | larga_estadia | all
  const filterStatus = params.status;   // confirmed | cancelled | etc.
  const filterDate = params.date;       // YYYY-MM-DD

  // Fetch Aeroparque reservations
  const aeroWhere: Record<string, unknown> = {};
  if (filterService && filterService !== "all") {
    aeroWhere.serviceType = filterService;
  }
  if (filterStatus && filterStatus !== "all") {
    aeroWhere.status = filterStatus;
  }
  if (filterDate) {
    const dayStart = new Date(filterDate);
    const dayEnd = new Date(filterDate);
    dayEnd.setDate(dayEnd.getDate() + 1);
    aeroWhere.reservedFrom = { gte: dayStart, lt: dayEnd };
  }

  const aeroReservations = await prisma.aeroparqueReservation.findMany({
    where: aeroWhere,
    orderBy: { reservedFrom: "asc" },
  });

  // Fetch Cruise reservations
  const cruiseWhere: Record<string, unknown> = {};
  if (filterStatus && filterStatus !== "all") {
    cruiseWhere.status = filterStatus;
  }
  if (filterDate) {
    const dayStart = new Date(filterDate);
    const dayEnd = new Date(filterDate);
    dayEnd.setDate(dayEnd.getDate() + 1);
    cruiseWhere.departureDate = { gte: dayStart, lt: dayEnd };
  }

  const showCruises = !filterService || filterService === "all" || filterService === "cruceros";
  const cruiseReservations = showCruises
    ? await prisma.cruiseReservation.findMany({
        where: cruiseWhere,
        orderBy: { departureDate: "asc" },
      })
    : [];

  // Stats
  const totalAero = aeroReservations.length;
  const totalCruise = cruiseReservations.length;
  const totalRevenue = aeroReservations.reduce(
    (sum, r) => sum + (r.paymentStatus === "paid" ? r.totalAmount : 0),
    0
  );
  const totalVehicles = totalAero + totalCruise;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-main">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-900">
              Agenda de Ingresos
            </h1>
            <p className="mt-1 text-brand-500">
              Panel unificado de reservas — Aeroparque + Cruceros
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Plane className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-900">{totalAero}</p>
                  <p className="text-xs text-brand-500">Aeroparque</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                  <Ship className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-900">{totalCruise}</p>
                  <p className="text-xs text-brand-500">Cruceros</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs text-brand-500">Facturado (Aero)</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Car className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-900">{totalVehicles}</p>
                  <p className="text-xs text-brand-500">Vehículos totales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <AgendaFilters
            currentService={filterService}
            currentStatus={filterStatus}
            currentDate={filterDate}
          />

          {/* Aeroparque Table */}
          {(filterService === "all" || filterService === "drop_go" || filterService === "larga_estadia" || !filterService) && (
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold text-brand-900">
                  Aeroparque ({totalAero})
                </h2>
              </div>

              {aeroReservations.length === 0 ? (
                <div className="rounded-2xl border border-brand-100 bg-white py-12 text-center">
                  <p className="text-brand-400">No hay reservas de Aeroparque con estos filtros.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-brand-100 bg-brand-50 text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <th className="px-4 py-3">Pedido</th>
                        <th className="px-4 py-3">Servicio</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Vehículo</th>
                        <th className="px-4 py-3">Fechas</th>
                        <th className="px-4 py-3">Vuelo</th>
                        <th className="px-4 py-3">Monto</th>
                        <th className="px-4 py-3">Pago</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50">
                      {aeroReservations.map((r) => (
                        <tr key={r.id} className="hover:bg-blue-50/30">
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="font-mono text-xs font-medium text-brand-600">
                              #{r.externalOrderId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getServiceColor(r.serviceType)}`}>
                              {getServiceLabel(r.serviceType)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-brand-900">
                              {r.firstName} {r.lastName}
                            </div>
                            <div className="text-xs text-brand-400">{r.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-sm font-bold text-brand-800">
                              {r.licensePlate}
                            </div>
                            <div className="text-xs text-brand-400">
                              {r.carBrand} {r.carModel}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-brand-700">
                              {formatDate(r.reservedFrom)}
                            </div>
                            <div className="text-xs text-brand-400">
                              → {formatDate(r.reservedUntil)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-brand-700">{r.airline}</div>
                            <div className="text-xs text-brand-400">
                              {r.flightNumber}
                              {r.arrivalTime && ` · ${r.arrivalTime}hs`}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-900">
                            {r.totalAmount > 0 ? formatCurrency(r.totalAmount) : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentColor(r.paymentStatus)}`}>
                              {getPaymentLabel(r.paymentStatus)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(r.status)}`}>
                              {getStatusLabel(r.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <AeroparqueStatusButton
                              reservationId={r.id}
                              currentStatus={r.status}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Cruceros Table */}
          {showCruises && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Ship className="h-5 w-5 text-violet-600" />
                <h2 className="text-xl font-bold text-brand-900">
                  Terminal de Cruceros ({totalCruise})
                </h2>
              </div>

              {cruiseReservations.length === 0 ? (
                <div className="rounded-2xl border border-brand-100 bg-white py-12 text-center">
                  <p className="text-brand-400">No hay reservas de cruceros con estos filtros.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-brand-100 bg-brand-50 text-xs font-semibold uppercase tracking-wider text-brand-500">
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Contacto</th>
                        <th className="px-4 py-3">Vehículo</th>
                        <th className="px-4 py-3">Viaje</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-50">
                      {cruiseReservations.map((r) => (
                        <tr key={r.id} className="hover:bg-violet-50/30">
                          <td className="whitespace-nowrap px-4 py-3 text-brand-500">
                            {formatDate(r.departureDate)}
                          </td>
                          <td className="px-4 py-3 font-medium text-brand-900">
                            {r.firstName} {r.lastName}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-brand-700">{r.email}</div>
                            <div className="text-xs text-brand-400">{r.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-sm font-bold text-brand-800">
                              {r.licensePlate}
                            </div>
                            <div className="text-xs text-brand-400">
                              {r.carBrand} {r.carModel}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-brand-700">
                              {formatDate(r.departureDate)} → {formatDate(r.returnDate)}
                            </div>
                            <div className="text-xs text-brand-400">
                              {r.passengers} pax
                              {r.cruiseLine && ` · ${r.cruiseLine}`}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(r.status)}`}>
                              {getStatusLabel(r.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <AeroparqueStatusButton
                              reservationId={r.id}
                              currentStatus={r.status}
                              apiBase="/api/reservas"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
