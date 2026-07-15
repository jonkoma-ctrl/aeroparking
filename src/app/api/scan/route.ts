import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServiceTypeLabel } from "@/lib/utils";

// POST /api/scan — Registra ingreso/egreso de un vehículo por su QR/código.
// Protegido: requiere la cookie admin_token (personal logueado).
//
// Body: { token: string, action?: "in" | "out" | "auto" }
//   - "in":  marca ingreso a la sede (check-in)
//   - "out": marca retiro (check-out)
//   - "auto" (default): si no ingresó → check-in; si ingresó y no salió → check-out
export async function POST(req: NextRequest) {
  // Auth: cookie del admin/personal
  const cookie = req.cookies.get("admin_token")?.value;
  if (!cookie || cookie !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  let body: { token?: string; action?: string; by?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
  }

  const rawToken = (body.token || "").trim().toUpperCase();
  const action = (body.action || "auto") as "in" | "out" | "auto";
  const by = (body.by || "").trim() || null;

  if (!rawToken) {
    return NextResponse.json({ ok: false, error: "Falta el código" }, { status: 400 });
  }

  // Si el QR encoda la URL /validar/XXXX, extraemos el token final.
  const token = rawToken.includes("/") ? rawToken.split("/").filter(Boolean).pop()! : rawToken;

  // Lookup case-insensitive por qrToken o por externalOrderId (fallback).
  const reservation = await prisma.aeroparqueReservation.findFirst({
    where: {
      OR: [
        { qrToken: { equals: token, mode: "insensitive" } },
        { externalOrderId: { equals: token, mode: "insensitive" } },
      ],
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { ok: false, status: "not_found", error: "No encontramos ninguna reserva con ese código." },
      { status: 404 }
    );
  }

  if (reservation.status === "cancelled") {
    return NextResponse.json({
      ok: false,
      status: "cancelled",
      error: "Esta reserva está cancelada.",
      reservation: summarize(reservation),
    });
  }

  const now = new Date();
  let resolved: "in" | "out";

  if (action === "in") resolved = "in";
  else if (action === "out") resolved = "out";
  else {
    // auto
    if (!reservation.checkedInAt) resolved = "in";
    else if (!reservation.checkedOutAt) resolved = "out";
    else {
      // Ya completó ambos
      return NextResponse.json({
        ok: false,
        status: "already_completed",
        error: "Este vehículo ya registró ingreso y retiro.",
        reservation: summarize(reservation),
      });
    }
  }

  if (resolved === "in") {
    if (reservation.checkedInAt) {
      return NextResponse.json({
        ok: false,
        status: "already_in",
        error: "Este vehículo ya está registrado como ingresado.",
        reservation: summarize(reservation),
      });
    }
    const updated = await prisma.aeroparqueReservation.update({
      where: { id: reservation.id },
      data: { checkedInAt: now, checkInBy: by, status: "checked_in" },
    });
    return NextResponse.json({
      ok: true,
      action: "in",
      message: "Ingreso registrado ✓",
      reservation: summarize(updated),
    });
  } else {
    if (!reservation.checkedInAt) {
      return NextResponse.json({
        ok: false,
        status: "no_checkin",
        error: "No podés registrar el retiro: este vehículo no tiene ingreso registrado.",
        reservation: summarize(reservation),
      });
    }
    if (reservation.checkedOutAt) {
      return NextResponse.json({
        ok: false,
        status: "already_out",
        error: "Este vehículo ya registró su retiro.",
        reservation: summarize(reservation),
      });
    }
    const updated = await prisma.aeroparqueReservation.update({
      where: { id: reservation.id },
      data: { checkedOutAt: now, checkOutBy: by, status: "completed" },
    });
    return NextResponse.json({
      ok: true,
      action: "out",
      message: "Retiro registrado ✓",
      reservation: summarize(updated),
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function summarize(r: any) {
  return {
    id: r.id,
    code: r.externalOrderId,
    customerName: r.customerName,
    licensePlate: r.licensePlate,
    carBrand: r.carBrand,
    carModel: r.carModel,
    destination: r.destination,
    serviceType: getServiceTypeLabel(r.serviceType),
    status: r.status,
    startDate: r.startDate,
    endDate: r.endDate,
    checkInTime: r.checkInTime,
    arrivalTime: r.arrivalTime,
    checkedInAt: r.checkedInAt,
    checkedOutAt: r.checkedOutAt,
    passengers: r.passengers,
  };
}
