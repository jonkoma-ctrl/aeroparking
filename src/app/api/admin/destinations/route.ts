import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/destinations — Lista todos (incluye inactivos)
export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { label: "asc" }],
    });
    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/admin/destinations — Crear destino nuevo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, label, shortLabel, iconKey, accentColor, description, addressInfo, sortOrder } = body;

    if (!slug || !label || !shortLabel) {
      return NextResponse.json({ error: "Faltan slug, label o shortLabel" }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Slug solo puede tener minúsculas, números y guiones" }, { status: 400 });
    }

    const dest = await prisma.destination.create({
      data: {
        slug,
        label,
        shortLabel,
        iconKey: iconKey || "plane",
        accentColor: accentColor || "blue",
        description: description || null,
        addressInfo: addressInfo || null,
        sortOrder: sortOrder ?? 100,
        active: true,
      },
    });
    return NextResponse.json(dest);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un destino con ese slug" }, { status: 409 });
    }
    console.error("Error creating destination:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/admin/destinations — Actualizar destino
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, label, shortLabel, iconKey, accentColor, description, addressInfo, sortOrder, active } = body;

    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (label !== undefined) data.label = label;
    if (shortLabel !== undefined) data.shortLabel = shortLabel;
    if (iconKey !== undefined) data.iconKey = iconKey;
    if (accentColor !== undefined) data.accentColor = accentColor;
    if (description !== undefined) data.description = description;
    if (addressInfo !== undefined) data.addressInfo = addressInfo;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (active !== undefined) data.active = active;

    const dest = await prisma.destination.update({ where: { id }, data });
    return NextResponse.json(dest);
  } catch (error) {
    console.error("Error updating destination:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
