import { NextRequest, NextResponse } from "next/server";
import { findReservationWithAccess, ACCESS_DENIED } from "@/lib/reservation-access";
import { prisma } from "@/lib/db";

// Patentes argentinas: AB123CD (Mercosur) o ABC123 (vieja). También motos (A123BCD).
const PLATE = /^([A-Z]{2}\d{3}[A-Z]{2}|[A-Z]{3}\d{3}|[A-Z]\d{3}[A-Z]{3})$/;

// POST /api/mi-reserva/patente { order, t | email, licensePlate }
// Cambia la patente mientras el auto todavía no ingresó a la playa.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const r = await findReservationWithAccess(body);
  if (!r) return NextResponse.json({ error: ACCESS_DENIED }, { status: 404 });

  const plate = String(body?.licensePlate || "").replace(/[\s-]+/g, "").toUpperCase();
  if (!PLATE.test(plate)) {
    return NextResponse.json({ error: "Revisá la patente (ej: AB123CD o ABC123)." }, { status: 400 });
  }
  if (r.checkedInAt) {
    return NextResponse.json({ error: "El auto ya ingresó: para cambiar la patente escribinos por WhatsApp." }, { status: 409 });
  }
  if (!["confirmed", "pending_payment", "payment_rejected", "payment_expired", "extension_requested"].includes(r.status)) {
    return NextResponse.json({ error: "Esta reserva ya no se puede modificar." }, { status: 409 });
  }
  if (plate === r.licensePlate) return NextResponse.json({ ok: true, licensePlate: plate });

  await prisma.aeroparqueReservation.update({
    where: { id: r.id },
    data: {
      licensePlate: plate,
      notes: `${r.notes ? r.notes + "\n" : ""}CAMBIO DE PATENTE (cliente): ${r.licensePlate} → ${plate} · ${new Date().toISOString()}`,
    },
  });
  return NextResponse.json({ ok: true, licensePlate: plate });
}
