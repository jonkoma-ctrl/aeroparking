import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/credits?email=&status=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const status = searchParams.get("status");

    const where: Record<string, string> = {};
    if (email) where.email = email.toLowerCase();
    if (status) where.status = status;

    const credits = await prisma.customerCredit.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(credits);
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/admin/credits — Create new credit
export async function POST(req: NextRequest) {
  try {
    const { email, amountAvailable, reason, sourceReservationId } = await req.json();

    if (!email || !amountAvailable) {
      return NextResponse.json({ error: "Faltan email o monto" }, { status: 400 });
    }

    const credit = await prisma.customerCredit.create({
      data: {
        email: email.toLowerCase(),
        amountAvailable: parseInt(amountAvailable, 10),
        reason: reason || null,
        sourceReservationId: sourceReservationId || null,
      },
    });
    return NextResponse.json(credit);
  } catch (error) {
    console.error("Error creating credit:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/admin/credits — Mark as used or expired
export async function PATCH(req: NextRequest) {
  try {
    const { id, status, usedReservationId } = await req.json();
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (status === "used") {
      data.status = "used";
      data.usedAt = new Date();
      if (usedReservationId) data.usedReservationId = usedReservationId;
    } else if (status === "expired" || status === "available") {
      data.status = status;
    }

    const credit = await prisma.customerCredit.update({ where: { id }, data });
    return NextResponse.json(credit);
  } catch (error) {
    console.error("Error updating credit:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
