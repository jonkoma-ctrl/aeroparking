import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BRAND_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata: Metadata = {
  title: `Vista del día — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ d?: string; tipo?: string }>;
}

function destinoLabel(d: string) {
  if (d === "puerto") return "Cruceros";
  if (d === "ezeiza") return "Ezeiza";
  return "Aeroparque";
}

// Rango de un día (00:00 a 23:59:59) en base a un offset o fecha ISO.
function dayRange(dateStr: string) {
  const base = new Date(`${dateStr}T00:00:00`);
  const start = new Date(base);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default async function DiaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tipo = sp.tipo === "salidas" ? "salidas" : "ingresos";

  // Fecha por defecto: hoy (hora AR = UTC-3)
  const now = new Date();
  const arNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const todayStr = arNow.toISOString().slice(0, 10);
  const dateStr = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : todayStr;

  const { start, end } = dayRange(dateStr);

  // Ingresos: reservas cuya startDate cae ese día.
  // Salidas: reservas cuya endDate cae ese día.
  const dateField = tipo === "salidas" ? "endDate" : "startDate";
  const timeField = tipo === "salidas" ? "arrivalTime" : "checkInTime";

  const reservations = await prisma.aeroparqueReservation.findMany({
    where: {
      [dateField]: { gte: start, lte: end },
      status: { notIn: ["cancelled"] },
    },
    orderBy: { [dateField]: "asc" },
  });

  // Ordenar por hora (checkInTime / arrivalTime string "HH:MM")
  const sorted = [...reservations].sort((a, b) => {
    const ta = (tipo === "salidas" ? a.arrivalTime : a.checkInTime) || "99:99";
    const tb = (tipo === "salidas" ? b.arrivalTime : b.checkInTime) || "99:99";
    return ta.localeCompare(tb);
  });

  // Navegación de fechas
  const prevDate = new Date(`${dateStr}T12:00:00`);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(`${dateStr}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  const fmtNav = (d: Date) => d.toISOString().slice(0, 10);

  const isToday = dateStr === todayStr;
  const humanDate = new Date(`${dateStr}T12:00:00`).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="p-4 sm:p-6">
      {/* Toolbar — se oculta al imprimir */}
      <div className="mb-5 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-900">Vista del día</h1>
            <p className="text-sm capitalize text-brand-500">
              {humanDate} {isToday && <span className="font-semibold text-brand-700">· HOY</span>}
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {/* Ingresos / Salidas */}
          <div className="inline-flex rounded-xl bg-brand-100 p-1">
            <Link
              href={`/admin/dia?d=${dateStr}&tipo=ingresos`}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                tipo === "ingresos" ? "bg-white text-brand-900 shadow-sm" : "text-brand-500"
              }`}
            >
              Ingresos
            </Link>
            <Link
              href={`/admin/dia?d=${dateStr}&tipo=salidas`}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                tipo === "salidas" ? "bg-white text-brand-900 shadow-sm" : "text-brand-500"
              }`}
            >
              Retiros
            </Link>
          </div>

          {/* Navegación de fecha */}
          <div className="inline-flex items-center gap-1">
            <Link href={`/admin/dia?d=${fmtNav(prevDate)}&tipo=${tipo}`}
              className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-50">←</Link>
            {!isToday && (
              <Link href={`/admin/dia?d=${todayStr}&tipo=${tipo}`}
                className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50">Hoy</Link>
            )}
            <Link href={`/admin/dia?d=${fmtNav(nextDate)}&tipo=${tipo}`}
              className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-50">→</Link>
          </div>
        </div>
      </div>

      {/* Encabezado imprimible */}
      <div className="mb-4 hidden print:block">
        <h1 className="text-xl font-bold">
          AEROPARKING — {tipo === "salidas" ? "Retiros" : "Ingresos"} · <span className="capitalize">{humanDate}</span>
        </h1>
        <p className="text-sm text-gray-600">{sorted.length} vehículo{sorted.length !== 1 ? "s" : ""}</p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 py-16 text-center print:border-0">
          <p className="text-brand-400">
            No hay {tipo === "salidas" ? "retiros" : "ingresos"} para este día.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white print:border-0">
          <table className="min-w-full text-sm">
            <thead className="border-b border-brand-200 bg-brand-50 text-left text-xs uppercase text-brand-500 print:bg-white">
              <tr>
                <th className="px-3 py-2.5">Hora</th>
                <th className="px-3 py-2.5">Cliente</th>
                <th className="px-3 py-2.5">Patente</th>
                <th className="px-3 py-2.5">Vehículo</th>
                <th className="px-3 py-2.5">Destino</th>
                <th className="px-3 py-2.5">Vuelo</th>
                <th className="px-3 py-2.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {sorted.map((r) => {
                const hora = (tipo === "salidas" ? r.arrivalTime : r.checkInTime) || "—";
                const done = tipo === "salidas" ? !!r.checkedOutAt : !!r.checkedInAt;
                const vuelo = tipo === "salidas"
                  ? [r.arrivalAirline, r.arrivalFlight].filter(Boolean).join(" ")
                  : [r.departureAirline, r.departureFlight].filter(Boolean).join(" ");
                return (
                  <tr key={r.id} className="align-top">
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-base font-bold text-brand-900">{hora}</td>
                    <td className="px-3 py-3 font-medium text-brand-900">{r.customerName}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono font-semibold text-brand-800">{r.licensePlate}</td>
                    <td className="px-3 py-3 text-brand-600">{r.carBrand} {r.carModel}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 print:bg-transparent print:px-0">
                        {destinoLabel(r.destination)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-brand-600">{vuelo || "—"}</td>
                    <td className="px-3 py-3 text-center">
                      {/* Checkbox visual para tildar a mano en la copia impresa */}
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded border ${done ? "border-green-500 bg-green-500 text-white" : "border-brand-300 print:border-black"}`}>
                        {done ? "✓" : ""}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
