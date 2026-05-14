import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { BRAND_NAME } from "@/lib/constants";
import { listActiveDestinations } from "@/lib/destinos";
import {
  computeKPIs,
  withDelta,
  groupByDay,
  groupByDestination,
  previousRange,
  type ReservationRow,
} from "@/lib/dashboard-stats";
import { DashboardView } from "@/components/admin/DashboardView";

export const metadata: Metadata = {
  title: `Admin — Dashboard — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    dest?: string;
    status?: string;
  }>;
}

function parseDate(s: string | undefined, fallback: Date): Date {
  if (!s) return fallback;
  const d = new Date(s);
  return isNaN(d.getTime()) ? fallback : d;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const now = new Date();

  // Default: últimos 30 días
  const defaultTo = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const defaultFrom = new Date(defaultTo.getTime() - 29 * 24 * 60 * 60 * 1000);
  defaultFrom.setHours(0, 0, 0, 0);

  const from = parseDate(sp.from, defaultFrom);
  const to = parseDate(sp.to, defaultTo);
  to.setHours(23, 59, 59, 999);

  const destFilter = sp.dest && sp.dest !== "todos" ? sp.dest : undefined;
  const statusFilter = sp.status && sp.status !== "todos" ? sp.status : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { startDate: { gte: from, lte: to } };
  if (destFilter) where.destination = destFilter;
  if (statusFilter) where.status = statusFilter;

  const [aeroRows, destinations] = await Promise.all([
    prisma.aeroparqueReservation.findMany({ where, orderBy: { startDate: "desc" } }),
    listActiveDestinations(),
  ]);

  const reservations: ReservationRow[] = aeroRows.map((r) => ({
    id: r.id,
    destination: r.destination,
    serviceType: r.serviceType,
    startDate: r.startDate,
    endDate: r.endDate,
    price: r.price,
    status: r.status,
    createdAt: r.createdAt,
    rawEmailBody: r.rawEmailBody,
  }));

  // Período anterior para deltas
  const prev = previousRange(from, to);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevWhere: any = { startDate: { gte: prev.from, lte: prev.to } };
  if (destFilter) prevWhere.destination = destFilter;
  if (statusFilter) prevWhere.status = statusFilter;
  const prevRows = await prisma.aeroparqueReservation.findMany({ where: prevWhere });
  const prevReservations: ReservationRow[] = prevRows.map((r) => ({
    id: r.id,
    destination: r.destination,
    serviceType: r.serviceType,
    startDate: r.startDate,
    endDate: r.endDate,
    price: r.price,
    status: r.status,
    createdAt: r.createdAt,
    rawEmailBody: r.rawEmailBody,
  }));

  const currKPIs = computeKPIs(reservations, now);
  const prevKPIs = computeKPIs(prevReservations, now);
  const kpis = withDelta(currKPIs, prevKPIs);

  const labels = Object.fromEntries(destinations.map((d) => [d.slug, d.shortLabel]));
  const byDay = groupByDay(reservations);
  const byDest = groupByDestination(reservations, labels);

  return (
    <DashboardView
      kpis={kpis}
      byDay={byDay}
      byDest={byDest}
      destinations={destinations.map((d) => ({ slug: d.slug, label: d.shortLabel }))}
      from={from.toISOString().slice(0, 10)}
      to={to.toISOString().slice(0, 10)}
      destFilter={sp.dest || "todos"}
      statusFilter={sp.status || "todos"}
    />
  );
}
