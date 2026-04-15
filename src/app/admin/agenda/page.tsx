import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  formatDate,
  getStatusLabel,
  getStatusColor,
  getServiceTypeLabel,
  formatPrice,
} from "@/lib/utils";
import { AeroparqueStatusButton } from "./AeroparqueStatusButton";
import { AdminStatusButton } from "../reservas/AdminStatusButton";

export const metadata: Metadata = {
  title: `Admin — Agenda — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

interface UnifiedReservation {
  id: string;
  destination: string;
  serviceType: string;
  customerName: string;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  startDate: Date;
  endDate: Date;
  price: number | null;
  status: string;
  createdAt: Date;
  source: "email" | "form";
}

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ dest?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const destFilter = params.dest || "todos";
  const fromDate = params.from || "";
  const toDate = params.to || "";

  const [aeroparqueRes, cruiseRes] = await Promise.all([
    prisma.aeroparqueReservation.findMany({ orderBy: { startDate: "desc" } }),
    prisma.cruiseReservation.findMany({ orderBy: { departureDate: "desc" } }),
  ]);

  // Normalize into unified list
  let unified: UnifiedReservation[] = [
    ...aeroparqueRes.map((r) => ({
      id: r.id,
      destination: r.destination || ((/Costa\s+Salguero/i.test(r.rawEmailBody || "")) ? "puerto" : "aeroparque"),
      serviceType: r.serviceType,
      customerName: r.customerName,
      licensePlate: r.licensePlate,
      carBrand: r.carBrand,
      carModel: r.carModel,
      startDate: r.startDate,
      endDate: r.endDate,
      price: r.price,
      status: r.status,
      createdAt: r.createdAt,
      source: "email" as const,
    })),
    ...cruiseRes.map((r) => ({
      id: r.id,
      destination: "puerto" as const,
      serviceType: "cruceros",
      customerName: `${r.firstName} ${r.lastName}`,
      licensePlate: r.licensePlate,
      carBrand: r.carBrand,
      carModel: r.carModel,
      startDate: r.departureDate,
      endDate: r.returnDate,
      price: null,
      status: r.status,
      createdAt: r.createdAt,
      source: "form" as const,
    })),
  ].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  // Apply destination filter
  if (destFilter === "aeroparque") {
    unified = unified.filter((r) => r.destination === "aeroparque");
  } else if (destFilter === "puerto") {
    unified = unified.filter((r) => r.destination === "puerto");
  }

  // Apply date filter
  if (fromDate) {
    const from = new Date(fromDate);
    unified = unified.filter((r) => r.startDate >= from);
  }
  if (toDate) {
    const to = new Date(toDate + "T23:59:59");
    unified = unified.filter((r) => r.startDate <= to);
  }

  // Counts (unfiltered)
  const totalAeroparque = aeroparqueRes.filter(
    (r) => !r.destination || r.destination === "aeroparque" || !(r.rawEmailBody || "").match(/Costa\s+Salguero/i)
  ).length;
  const totalPuerto =
    aeroparqueRes.length - totalAeroparque + cruiseRes.length;

  function filterUrl(dest: string, from?: string, to?: string) {
    const p = new URLSearchParams();
    if (dest !== "todos") p.set("dest", dest);
    if (from || fromDate) p.set("from", from ?? fromDate);
    if (to || toDate) p.set("to", to ?? toDate);
    const qs = p.toString();
    return `/admin/agenda${qs ? `?${qs}` : ""}`;
  }

  const destTabs = [
    { key: "todos", label: "Todos", count: aeroparqueRes.length + cruiseRes.length },
    { key: "aeroparque", label: "Aeroparque", count: totalAeroparque },
    { key: "puerto", label: "Puerto", count: totalPuerto },
  ];

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-900">
            Agenda de Reservas
          </h1>
          <p className="mt-1 text-sm text-brand-500">
            {unified.length} reserva{unified.length !== 1 && "s"}
            {destFilter !== "todos" && ` (filtro: ${destFilter})`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          {/* Destination tabs */}
          <div className="flex gap-1 rounded-lg bg-brand-100 p-1">
            {destTabs.map((tab) => (
              <a
                key={tab.key}
                href={filterUrl(tab.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  destFilter === tab.key
                    ? "bg-white text-brand-900 shadow-sm"
                    : "text-brand-500 hover:text-brand-700"
                }`}
              >
                {tab.label}
                <span className="ml-1 text-xs text-brand-400">
                  {tab.count}
                </span>
              </a>
            ))}
          </div>

          {/* Date filters */}
          <form className="flex items-end gap-2" method="get" action="/admin/agenda">
            {destFilter !== "todos" && (
              <input type="hidden" name="dest" value={destFilter} />
            )}
            <div>
              <label className="block text-xs text-brand-500 mb-1">Desde</label>
              <input
                type="date"
                name="from"
                defaultValue={fromDate}
                className="rounded-md border border-brand-200 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-500 mb-1">Hasta</label>
              <input
                type="date"
                name="to"
                defaultValue={toDate}
                className="rounded-md border border-brand-200 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-brand-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-800"
            >
              Filtrar
            </button>
            {(fromDate || toDate) && (
              <a
                href={filterUrl(destFilter, "", "")}
                className="rounded-md px-3 py-1.5 text-sm text-brand-500 hover:text-brand-700"
              >
                Limpiar
              </a>
            )}
          </form>

          {/* Export CSV */}
          <a
            href={`/api/admin/export?${new URLSearchParams({
              ...(destFilter !== "todos" ? { dest: destFilter } : {}),
              ...(fromDate ? { from: fromDate } : {}),
              ...(toDate ? { to: toDate } : {}),
            }).toString()}`}
            className="rounded-md border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            📥 Exportar CSV
          </a>
        </div>

        {unified.length === 0 ? (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 py-16 text-center">
            <p className="text-brand-400">
              No hay reservas para los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-200 text-xs font-semibold uppercase tracking-wider text-brand-500">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Destino</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {unified.map((r) => (
                  <tr key={`${r.destination}-${r.id}`} className="hover:bg-brand-50">
                    <td className="whitespace-nowrap px-4 py-3 text-brand-500">
                      <div>{formatDate(r.startDate)}</div>
                      <div className="text-xs text-brand-400">
                        → {formatDate(r.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.destination === "aeroparque"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {r.destination === "aeroparque" ? "AEP" : "Puerto"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-900">
                      <Link
                        href={r.source === "email" ? `/admin/agenda/${r.id}` : `/admin/reservas/${r.id}`}
                        className="hover:text-brand-600 hover:underline"
                      >
                        {r.customerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-brand-700">
                        {r.licensePlate}
                      </div>
                      <div className="text-xs text-brand-400">
                        {r.carBrand} {r.carModel}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-700">
                      {getServiceTypeLabel(r.serviceType)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-brand-700">
                      {r.price !== null ? formatPrice(r.price) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          r.status
                        )}`}
                      >
                        {getStatusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.source === "email" ? (
                        <AeroparqueStatusButton
                          reservationId={r.id}
                          currentStatus={r.status}
                        />
                      ) : (
                        <AdminStatusButton
                          reservationId={r.id}
                          currentStatus={r.status}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
