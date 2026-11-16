import { NextRequest, NextResponse } from "next/server";
import { findReservationWithAccess, ACCESS_DENIED } from "@/lib/reservation-access";
import { UNPAID_STATUSES } from "@/lib/mp";

export const dynamic = "force-dynamic";

const PAID = ["confirmed", "checked_in", "completed", "cancellation_requested", "extension_requested"];

// GET /api/mi-reserva?order=KP-2026-123456&t=<link firmado>  ó  &email=<mail de la reserva>
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const r = await findReservationWithAccess({ order: q.get("order"), email: q.get("email"), t: q.get("t") });
  if (!r) return NextResponse.json({ error: ACCESS_DENIED }, { status: 404 });

  const paid = PAID.includes(r.status);
  return NextResponse.json({
    id: r.id,
    externalOrderId: r.externalOrderId,
    destination: r.destination,
    serviceType: r.serviceType,
    customerName: r.customerName,
    email: r.email,
    licensePlate: r.licensePlate,
    carBrand: r.carBrand,
    carModel: r.carModel,
    startDate: r.startDate,
    endDate: r.endDate,
    checkInTime: r.checkInTime,
    arrivalTime: r.arrivalTime,
    departureAirline: r.departureAirline,
    departureFlight: r.departureFlight,
    arrivalAirline: r.arrivalAirline,
    arrivalFlight: r.arrivalFlight,
    cruiseLine: r.cruiseLine,
    passengers: r.passengers,
    price: r.paidAmount ?? r.price,
    status: r.status,
    paid,
    unpaid: (UNPAID_STATUSES as readonly string[]).includes(r.status),
    checkedIn: !!r.checkedInAt,
    // El QR sólo se muestra con la reserva paga.
    qrToken: paid ? r.qrToken : null,
  });
}
