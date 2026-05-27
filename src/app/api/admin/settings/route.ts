import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/settings — Obtiene la fila singleton (crea si no existe)
export async function GET() {
  try {
    let row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!row) {
      row = await prisma.siteSettings.create({ data: { id: "singleton" } });
    }
    return NextResponse.json(row);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/admin/settings
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { heroImageUrl, heroImageAlt, heroTitle, heroSubtitle, whatsappPhone, contactEmail, reviewUrl } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (heroImageUrl !== undefined) data.heroImageUrl = heroImageUrl || null;
    if (heroImageAlt !== undefined) data.heroImageAlt = heroImageAlt || null;
    if (heroTitle !== undefined) data.heroTitle = heroTitle || null;
    if (heroSubtitle !== undefined) data.heroSubtitle = heroSubtitle || null;
    if (whatsappPhone !== undefined) data.whatsappPhone = whatsappPhone || null;
    if (contactEmail !== undefined) data.contactEmail = contactEmail || null;
    if (reviewUrl !== undefined) data.reviewUrl = reviewUrl || null;

    const row = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    return NextResponse.json(row);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
