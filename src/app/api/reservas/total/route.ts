import { NextRequest, NextResponse } from "next/server";
import { reservationTotalFor } from "@/lib/reservation-total";

export const dynamic = "force-dynamic";

// GET /api/reservas/total?destination=&serviceType=&startDate=&checkInTime=&endDate=&arrivalTime=
// Total que se va a cobrar, armado igual que en POST /api/reservas/presencial.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const destination = q.get("destination") || "";
  const serviceType = q.get("serviceType") || "";
  const startDate = q.get("startDate") || "";
  const endDate = q.get("endDate") || "";
  const checkInTime = q.get("checkInTime") || "";
  const arrivalTime = q.get("arrivalTime") || "";
  if (!destination || !serviceType || !startDate || !endDate || !checkInTime || !arrivalTime) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  const start = new Date(`${startDate}T${checkInTime}`);
  const end = new Date(`${endDate}T${arrivalTime}`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
  }
  const total = await reservationTotalFor(destination, serviceType, start, end);
  return NextResponse.json({ total });
}
