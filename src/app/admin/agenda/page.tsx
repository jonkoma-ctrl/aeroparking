import type { Metadata } from "next";
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
  origin: "aeroparque" | "cruceros";
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
}

export default async function AdminAgendaPage() {
  const [aeroparqueRes, cruiseRes] = await Promise.all([
    prisma.aeroparqueReservation.findMany({ orderBy: { startDate: "desc" } }),
    prisma.cruiseReservation.findMany({ orderBy: { departureDate: "desc" } }),
  ]);

  // Normalize into unified list
  const unified: UnifiedReservation[] = [
    ...aeroparqueRes.map((r) => ({
      id: r.id,
      origin: "aeroparque" as const,
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
    })),
    ...cruiseRes.map((r) => ({
      id: r.id,
      origin: "cruceros" as const,
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
    })),
  ].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const totalAeroparque = aeroparqueRes.length;
  const totalCruceros = cruiseRes.length;

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">
              Agenda de Reservas
            </h1>
            <p className="mt-1 text-sm text-brand-500">
              {unified.length} reserva{unified.length !== 1 && "s"} —{" "}
              {totalAeroparque} Aeroparque, {totalCruceros} Cruceros
            </p>
          </div>
        </div>

        {unified.length === 0 ? (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 py-16 text-center">
            <p className="text-brand-400">
              No hay reservas registradas todavía.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-200 text-xs font-semibold uppercase tracking-wider text-brand-500">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Origen</th>
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
                  <tr key={`${r.origin}-${r.id}`} className="hover:bg-brand-50">
                    <td className="whitespace-nowrap px-4 py-3 text-brand-500">
                      <div>{formatDate(r.startDate)}</div>
                      <div className="text-xs text-brand-400">
                        → {formatDate(r.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.origin === "aeroparque"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-cyan-100 text-cyan-700"
                        }`}
                      >
                        {r.origin === "aeroparque" ? "AEP" : "Cruceros"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-900">
                      {r.customerName}
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
                      {r.origin === "aeroparque" ? (
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
