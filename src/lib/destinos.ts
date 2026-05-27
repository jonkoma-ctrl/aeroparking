import { prisma } from "./db";

export interface DestinationMeta {
  slug: string;
  label: string;
  shortLabel: string;
  iconKey: string;     // "plane" | "ship" | "bus" — render-side mapping
  accentColor: string; // "blue" | "sky" | "violet" | "amber" — tailwind hue
  description: string | null;
  addressInfo: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  active: boolean;
  sortOrder: number;
  /** Si el destino tiene traslado no incluido, el costo por tramo en ARS. Null = traslado incluido. */
  transferCostPerLeg: number | null;
}

/// Lista todos los destinos activos, ordenados por sortOrder.
/// Hace JOIN implícito con ServicePricing para resolver transferCostPerLeg.
/// Server-only. Usar desde server components o route handlers.
export async function listActiveDestinations(): Promise<DestinationMeta[]> {
  const [destinations, tariffs] = await Promise.all([
    prisma.destination.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    }),
    prisma.servicePricing.findMany({
      where: { active: true, transferIncluded: false },
      select: { destination: true, transferCostPerLeg: true },
    }),
  ]);
  const transferBySlug = new Map<string, number | null>();
  for (const t of tariffs) {
    if (!transferBySlug.has(t.destination)) {
      transferBySlug.set(t.destination, t.transferCostPerLeg ?? null);
    }
  }
  return destinations.map((row) => toMeta(row, transferBySlug.get(row.slug) ?? null));
}

export async function listAllDestinations(): Promise<DestinationMeta[]> {
  const rows = await prisma.destination.findMany({
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
  return rows.map((r) => toMeta(r, null));
}

export async function getDestinationBySlug(slug: string): Promise<DestinationMeta | null> {
  const [row, tariff] = await Promise.all([
    prisma.destination.findUnique({ where: { slug } }),
    prisma.servicePricing.findFirst({
      where: { destination: slug, active: true, transferIncluded: false },
      select: { transferCostPerLeg: true },
    }),
  ]);
  return row ? toMeta(row, tariff?.transferCostPerLeg ?? null) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMeta(row: any, transferCostPerLeg: number | null): DestinationMeta {
  return {
    slug: row.slug,
    label: row.label,
    shortLabel: row.shortLabel,
    iconKey: row.iconKey,
    accentColor: row.accentColor,
    description: row.description ?? null,
    addressInfo: row.addressInfo ?? null,
    imageUrl: row.imageUrl ?? null,
    imageAlt: row.imageAlt ?? null,
    active: row.active,
    sortOrder: row.sortOrder,
    transferCostPerLeg,
  };
}
