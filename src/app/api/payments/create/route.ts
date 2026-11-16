import { NextResponse } from "next/server";

// Flujo de cobro viejo (pre-KingPark), sin uso desde la web. Quedó apagado
// para que nadie pueda crear cobros reales con la cuenta de Border's por acá.
// El cobro vigente es POST /api/reservas/presencial → Mercado Pago.
export async function POST() {
  return NextResponse.json({ error: "Este medio de pago ya no está disponible." }, { status: 410 });
}
