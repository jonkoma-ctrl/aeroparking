import { NextRequest, NextResponse } from "next/server";
import { findReservationWithAccess, ACCESS_DENIED } from "@/lib/reservation-access";
import { sendClientConfirmation } from "@/lib/reservation-payment";
import { prisma } from "@/lib/db";

// POST /api/mi-reserva/reenviar { order, t | email } — reenvía el mail con el QR
// (sólo al mail de la reserva, sólo si está paga). Tope: 1 cada 2 minutos.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const r = await findReservationWithAccess(body);
  if (!r) return NextResponse.json({ error: ACCESS_DENIED }, { status: 404 });
  if (!["confirmed", "checked_in", "extension_requested"].includes(r.status)) {
    return NextResponse.json({ error: "El mail con el QR se envía cuando la reserva está paga." }, { status: 409 });
  }
  const recent = /REENVIO MAIL (\S+)$/.exec(r.notes || "");
  if (recent && Date.now() - new Date(recent[1]).getTime() < 2 * 60 * 1000) {
    return NextResponse.json({ error: "Ya te lo reenviamos recién. Revisá también la carpeta de spam." }, { status: 429 });
  }
  try {
    await sendClientConfirmation(r);
  } catch (err) {
    console.error("[mi-reserva/reenviar] error:", err);
    return NextResponse.json({ error: "No pudimos enviar el mail. Probá de nuevo en un rato." }, { status: 502 });
  }
  await prisma.aeroparqueReservation.update({
    where: { id: r.id },
    data: { notes: `${r.notes ? r.notes + "\n" : ""}REENVIO MAIL ${new Date().toISOString()}` },
  });
  return NextResponse.json({ ok: true, email: r.email });
}
