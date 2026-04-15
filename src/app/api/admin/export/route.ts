import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/export?dest=&serviceType=&status=&from=&to=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dest = searchParams.get("dest");
  const serviceType = searchParams.get("serviceType");
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (dest && dest !== "todos") where.destination = dest;
  if (serviceType) where.serviceType = serviceType;
  if (status) where.status = status;
  if (from || to) {
    where.startDate = {};
    if (from) where.startDate.gte = new Date(from);
    if (to) where.startDate.lte = new Date(to + "T23:59:59");
  }

  const reservations = await prisma.aeroparqueReservation.findMany({
    where,
    orderBy: { startDate: "desc" },
  });

  const header = "Pedido,Estado,Destino,Servicio,Cliente,Email,Telefono,DNI,Patente,Marca,Modelo,Ingreso,Retiro,Precio,Aerolinea Salida,Vuelo Salida,Aerolinea Arribo,Vuelo Arribo,Hora Arribo,Pasajeros";

  const rows = reservations.map((r) => {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return [
      r.externalOrderId,
      r.status,
      r.destination,
      r.serviceType,
      `"${r.customerName}"`,
      r.email || "",
      r.phone || "",
      r.dni || "",
      r.licensePlate,
      `"${r.carBrand}"`,
      `"${r.carModel}"`,
      fmt(r.startDate),
      fmt(r.endDate),
      r.price,
      r.departureAirline || "",
      r.departureFlight || "",
      r.arrivalAirline || "",
      r.arrivalFlight || "",
      r.arrivalTime || "",
      r.passengers || "",
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aeroparking-reservas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
