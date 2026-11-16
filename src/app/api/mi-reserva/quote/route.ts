import { NextRequest, NextResponse } from "next/server";
import { findReservationWithAccess, ACCESS_DENIED } from "@/lib/reservation-access";
import { reservationTotalFor } from "@/lib/reservation-total";

// GET /api/mi-reserva/quote?order=&t=|email=&newEndDate=YYYY-MM-DD
// Diferencia a pagar por extender: total con la nueva fecha − lo ya pagado.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const r = await findReservationWithAccess({ order: q.get("order"), email: q.get("email"), t: q.get("t") });
  if (!r) return NextResponse.json({ error: ACCESS_DENIED }, { status: 404 });

  const newEndDate = q.get("newEndDate") || "";
  const time = r.arrivalTime || "12:00";
  const newEnd = new Date(`${newEndDate}T${time}`);
  if (!newEndDate || isNaN(newEnd.getTime()) || newEnd <= r.endDate) {
    return NextResponse.json({ error: "Elegí una fecha posterior a la de retiro actual." }, { status: 400 });
  }
  const newTotal = await reservationTotalFor(r.destination, r.serviceType, r.startDate, newEnd);
  const paid = r.paidAmount ?? r.price;
  const extensionCost = Math.max(0, newTotal - paid);
  const extraDays = Math.ceil((newEnd.getTime() - r.endDate.getTime()) / 86400000);
  return NextResponse.json({ extraDays, newTotal, extensionCost, currentEndDate: r.endDate, newEndDate });
}
