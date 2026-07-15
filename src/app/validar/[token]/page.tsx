import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BRAND_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Verificación de reserva — ${BRAND_NAME}`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function destinoLabel(d: string) {
  if (d === "puerto") return "Terminal de Cruceros";
  if (d === "ezeiza") return "Aeropuerto de Ezeiza";
  return "Aeroparque Jorge Newbery";
}

export default async function ValidarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = token.trim().toUpperCase();

  const reservation = await prisma.aeroparqueReservation.findFirst({
    where: {
      OR: [
        { qrToken: { equals: t, mode: "insensitive" } },
        { externalOrderId: { equals: t, mode: "insensitive" } },
      ],
    },
  });

  // Semáforo de estado
  let tone: "green" | "red" | "amber" | "blue" = "blue";
  let title = "";
  let subtitle = "";

  if (!reservation) {
    tone = "red";
    title = "Código no encontrado";
    subtitle = "No existe ninguna reserva con este código.";
  } else if (reservation.status === "cancelled") {
    tone = "red";
    title = "Reserva cancelada";
    subtitle = "Esta reserva figura como cancelada.";
  } else if (reservation.checkedOutAt) {
    tone = "blue";
    title = "Viaje completado";
    subtitle = "El vehículo ya registró ingreso y retiro.";
  } else if (reservation.checkedInAt) {
    tone = "amber";
    title = "Vehículo en sede";
    subtitle = "El auto está registrado en Costa Salguero.";
  } else {
    tone = "green";
    title = "Reserva válida";
    subtitle = "Lista para registrar el ingreso.";
  }

  const toneClasses: Record<typeof tone, { bg: string; ring: string; text: string; badge: string }> = {
    green: { bg: "bg-green-50", ring: "border-green-300", text: "text-green-800", badge: "bg-green-600" },
    red: { bg: "bg-red-50", ring: "border-red-300", text: "text-red-800", badge: "bg-red-600" },
    amber: { bg: "bg-amber-50", ring: "border-amber-300", text: "text-amber-900", badge: "bg-amber-500" },
    blue: { bg: "bg-blue-50", ring: "border-blue-300", text: "text-blue-800", badge: "bg-blue-600" },
  };
  const c = toneClasses[tone];

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <div className="w-full max-w-md">
        <div className={`rounded-3xl border-2 ${c.ring} ${c.bg} p-8 text-center shadow-elevated`}>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${c.badge}`}>
            <span className="font-display text-2xl font-black text-white">
              AERO
            </span>
          </div>
          <h1 className={`font-display text-2xl font-extrabold ${c.text}`}>{title}</h1>
          <p className={`mt-1 text-sm ${c.text} opacity-80`}>{subtitle}</p>

          {reservation && (
            <div className="mt-6 rounded-2xl bg-white/70 p-5 text-left">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-brand-900">
                  {reservation.licensePlate}
                </span>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {destinoLabel(reservation.destination)}
                </span>
              </div>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-brand-500">Cliente</dt>
                  <dd className="font-medium text-brand-900">{reservation.customerName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-500">Vehículo</dt>
                  <dd className="font-medium text-brand-900">
                    {reservation.carBrand} {reservation.carModel}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-500">Ingreso</dt>
                  <dd className="font-medium text-brand-900">
                    {formatDate(reservation.startDate)}
                    {reservation.checkInTime ? ` · ${reservation.checkInTime}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-500">Código</dt>
                  <dd className="font-mono text-brand-900">{reservation.externalOrderId}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-brand-400">
          Esta página verifica la reserva. Para registrar el ingreso o retiro, el personal
          usa el <Link href="/admin/scan" className="underline">escáner interno</Link>.
        </p>
      </div>
    </div>
  );
}
