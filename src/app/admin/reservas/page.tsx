import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";
import { AdminStatusButton } from "./AdminStatusButton";

export const metadata: Metadata = {
  title: `Admin — Reservas — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

export default async function AdminReservasPage() {
  const reservations = await prisma.cruiseReservation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">
              Reservas — Terminal de Cruceros
            </h1>
            <p className="mt-1 text-sm text-brand-500">
              {reservations.length} reserva{reservations.length !== 1 && "s"}{" "}
              registrada{reservations.length !== 1 && "s"}
            </p>
          </div>
        </div>

        {reservations.length === 0 ? (
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
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Viaje</th>
                  <th className="px-4 py-3">Vehículo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-50">
                    <td className="whitespace-nowrap px-4 py-3 text-brand-500">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-brand-900">
                      {r.firstName} {r.lastName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-brand-700">{r.email}</div>
                      <div className="text-xs text-brand-400">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-brand-700">
                        {formatDate(r.departureDate)} →{" "}
                        {formatDate(r.returnDate)}
                      </div>
                      <div className="text-xs text-brand-400">
                        {r.passengers} pasajero
                        {r.passengers !== 1 && "s"}
                        {r.cruiseLine && ` · ${r.cruiseLine}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-brand-700">
                        {r.licensePlate}
                      </div>
                      <div className="text-xs text-brand-400">
                        {r.carBrand} {r.carModel}
                      </div>
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
                      <AdminStatusButton
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
    </div>
  );
}
