import { NextRequest, NextResponse } from "next/server";
import { qrPngBuffer } from "@/lib/qr";

// GET /api/qr/[token] — Devuelve el PNG del QR para ese token.
// Usado por el email de confirmación (<img src>) y la web.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Validación básica del formato del token (6 chars del alfabeto).
  if (!/^[A-Z0-9]{4,12}$/.test(token)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  try {
    const png = await qrPngBuffer(token);
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("[api/qr] error generando QR:", e);
    return NextResponse.json({ error: "Error generando QR" }, { status: 500 });
  }
}
