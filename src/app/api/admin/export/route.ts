import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/export?dest=&serviceType=&status=&from=&to=
//
// Genera un CSV compatible con Excel en configuración regional española:
//  - Separador ";" (Excel es-AR/es-ES interpreta la coma como decimal y
//    mete todo en una sola columna si se usa ",").
//  - BOM UTF-8 al inicio para que Excel muestre bien acentos y ñ.
//  - Todos los campos entre comillas, con comillas internas escapadas.
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

  const SEP = ";";

  // Escapar un valor para CSV: siempre entre comillas, comillas internas dobladas.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (v: any): string => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const fmtDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  // Extrae "HH:MM" desde un DateTime (hora AR, UTC-3) como fallback si el
  // campo de hora en string viniera vacío.
  const fmtTime = (d: Date) => {
    const ar = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return `${String(ar.getUTCHours()).padStart(2, "0")}:${String(ar.getUTCMinutes()).padStart(2, "0")}`;
  };

  const header = [
    "Pedido", "Estado", "Destino", "Servicio", "Cliente", "Email", "Telefono",
    "DNI", "Patente", "Marca", "Modelo",
    "Fecha Ingreso", "Hora Ingreso", "Fecha Retiro", "Hora Retiro",
    "Precio",
    "Aerolinea Salida", "Vuelo Salida", "Aerolinea Regreso", "Vuelo Regreso",
    "Pasajeros",
  ].map(q).join(SEP);

  const rows = reservations.map((r) =>
    [
      r.externalOrderId,
      r.status,
      r.destination,
      r.serviceType,
      r.customerName,
      r.email || "",
      r.phone || "",
      r.dni || "",
      r.licensePlate,
      r.carBrand,
      r.carModel,
      fmtDate(r.startDate),
      r.checkInTime || fmtTime(r.startDate),
      fmtDate(r.endDate),
      r.arrivalTime || fmtTime(r.endDate),
      r.price ?? "",
      r.departureAirline || "",
      r.departureFlight || "",
      r.arrivalAirline || "",
      r.arrivalFlight || "",
      r.passengers ?? "",
    ].map(q).join(SEP)
  );

  // BOM UTF-8 para que Excel detecte la codificación correctamente.
  const csv = "\uFEFF" + [header, ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aeroparking-reservas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
