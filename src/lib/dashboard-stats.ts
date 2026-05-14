/**
 * Helpers de agregación para el dashboard admin.
 * Sin side effects, testeable.
 */

export interface ReservationRow {
  id: string;
  destination: string | null;
  serviceType: string;
  startDate: Date;
  endDate: Date;
  price: number | null;
  status: string;
  createdAt: Date;
  rawEmailBody?: string | null;
}

export interface KPIBlock {
  totalReservations: number;
  totalRevenue: number;
  averageTicket: number;
  carsOnSite: number;       // status=checked_in y startDate <= now < endDate
  noShowRate: number;       // 0..1
  cancelRate: number;       // 0..1
}

export interface DeltaKPIBlock extends KPIBlock {
  deltaReservations: number | null;   // % vs período anterior
  deltaRevenue: number | null;
  deltaTicket: number | null;
}

export interface DayBucket {
  date: string;      // YYYY-MM-DD
  count: number;
  revenue: number;
}

export interface DestinationBucket {
  destination: string;       // slug normalizado
  label: string;             // shortLabel
  count: number;
  revenue: number;
  pct: number;               // 0..100
}

/** Normaliza el destino — algunos rows tienen null o legacy. */
export function normalizeDestination(r: ReservationRow): string {
  if (r.destination) return r.destination;
  if (r.rawEmailBody && /Costa\s+Salguero/i.test(r.rawEmailBody)) return "puerto";
  return "aeroparque";
}

/** Computa KPIs sobre una lista de reservas. */
export function computeKPIs(reservations: ReservationRow[], now: Date = new Date()): KPIBlock {
  const total = reservations.length;
  const totalRevenue = reservations.reduce((acc, r) => acc + (r.price || 0), 0);
  const averageTicket = total > 0 ? totalRevenue / total : 0;

  const carsOnSite = reservations.filter(
    (r) =>
      r.status === "checked_in" &&
      r.startDate.getTime() <= now.getTime() &&
      r.endDate.getTime() > now.getTime()
  ).length;

  const finalized = reservations.filter((r) =>
    ["completed", "no_show", "cancelled"].includes(r.status)
  ).length;
  const noShows = reservations.filter((r) => r.status === "no_show").length;
  const cancels = reservations.filter((r) => r.status === "cancelled").length;

  return {
    totalReservations: total,
    totalRevenue,
    averageTicket,
    carsOnSite,
    noShowRate: finalized > 0 ? noShows / finalized : 0,
    cancelRate: finalized > 0 ? cancels / finalized : 0,
  };
}

export function withDelta(current: KPIBlock, previous: KPIBlock | null): DeltaKPIBlock {
  function pct(curr: number, prev: number): number | null {
    if (prev === 0) return curr === 0 ? 0 : null;
    return ((curr - prev) / prev) * 100;
  }
  return {
    ...current,
    deltaReservations: previous ? pct(current.totalReservations, previous.totalReservations) : null,
    deltaRevenue: previous ? pct(current.totalRevenue, previous.totalRevenue) : null,
    deltaTicket: previous ? pct(current.averageTicket, previous.averageTicket) : null,
  };
}

/** Agrupa por día (YYYY-MM-DD según startDate). */
export function groupByDay(reservations: ReservationRow[]): DayBucket[] {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const r of reservations) {
    const date = r.startDate.toISOString().slice(0, 10);
    const entry = map.get(date) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += r.price || 0;
    map.set(date, entry);
  }
  return Array.from(map.entries())
    .map(([date, v]) => ({ date, count: v.count, revenue: v.revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Agrupa por destino con porcentajes. */
export function groupByDestination(
  reservations: ReservationRow[],
  labels: Record<string, string> = {}
): DestinationBucket[] {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const r of reservations) {
    const dest = normalizeDestination(r);
    const entry = map.get(dest) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += r.price || 0;
    map.set(dest, entry);
  }
  const total = reservations.length;
  return Array.from(map.entries())
    .map(([destination, v]) => ({
      destination,
      label: labels[destination] || destination,
      count: v.count,
      revenue: v.revenue,
      pct: total > 0 ? (v.count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Devuelve el rango "anterior" del mismo tamaño que [from, to]. */
export function previousRange(from: Date, to: Date): { from: Date; to: Date } {
  const ms = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - ms - 1),
    to: new Date(from.getTime() - 1),
  };
}
