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
}

/// Lista todos los destinos activos, ordenados por sortOrder.
/// Server-only. Usar desde server components o route handlers.
export async function listActiveDestinations(): Promise<DestinationMeta[]> {
  const rows = await prisma.destination.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  return rows.map(toMeta);
}

export async function listAllDestinations(): Promise<DestinationMeta[]> {
  const rows = await prisma.destination.findMany({
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { label: "asc" }],
  });
  return rows.map(toMeta);
}

export async function getDestinationBySlug(slug: string): Promise<DestinationMeta | null> {
  const row = await prisma.destination.findUnique({ where: { slug } });
  return row ? toMeta(row) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMeta(row: any): DestinationMeta {
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
  };
}
