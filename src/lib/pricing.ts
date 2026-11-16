export type Destino = "aeroparque" | "puerto" | "ezeiza";

// ServiceType matches DB format: destination + "_" + serviceType row
export type ServiceType =
  | "aeroparque_drop_go"
  | "aeroparque_larga_estadia"
  | "puerto_larga_estadia"
  | "puerto_cruceros"
  | "ezeiza_larga_estadia";

// DB uses simple service types, we combine with destination for ServiceType identifier
export type DbServiceType = "drop_go" | "larga_estadia" | "cruceros";

export function toServiceType(destination: Destino, dbServiceType: string): ServiceType {
  return `${destination}_${dbServiceType}` as ServiceType;
}

export function fromServiceType(st: ServiceType): { destination: Destino; dbServiceType: DbServiceType } {
  const [destination, ...rest] = st.split("_");
  return { destination: destination as Destino, dbServiceType: rest.join("_") as DbServiceType };
}

export interface DurationDiscount {
  fromDays: number;
  pctOff: number;
}

/** Fila de la grilla de precios: N días → precio total absoluto. */
export interface PriceTier {
  days: number;
  price: number;
}

export interface PricingRule {
  id?: string;
  destination: Destino;
  serviceType: ServiceType;
  pricePerDay: number;
  isReference: boolean;
  externalCheckoutUrl?: string | null;
  minDays?: number | null;
  maxDays?: number | null;
  durationDiscounts?: DurationDiscount[] | null;
  description?: string | null;
  /** false → el traslado se cobra aparte por tramo (Ezeiza) */
  transferIncluded?: boolean;
  /** ARS por tramo, solo cuando transferIncluded === false */
  transferCostPerLeg?: number | null;
  /** Grilla de precios por cantidad de días (absoluto). Prioridad sobre lineal. */
  priceTable?: PriceTier[] | null;
  /** Precio por día adicional después del último tramo de la grilla. */
  extraDayPrice?: number | null;
}

/**
 * Calcula el precio total según la grilla de precios (si está cargada) o
 * el modelo lineal (días × pricePerDay) como fallback.
 *
 * Con grilla:
 *  - Si existe un tramo exacto para `days`, usa ese precio.
 *  - Si `days` supera el máximo tramo, precio = precio_del_máximo +
 *    (days − días_máximo) × extraDayPrice (o × precio_promedio si no hay extra).
 *  - Si `days` es menor al mínimo tramo, usa el primer tramo.
 */
export function priceForDays(
  days: number,
  priceTable: PriceTier[] | null | undefined,
  extraDayPrice: number | null | undefined,
  pricePerDayFallback: number
): number {
  const table = (priceTable || []).filter((t) => t && t.days > 0 && t.price >= 0).sort((a, b) => a.days - b.days);
  if (table.length === 0) {
    // Sin grilla: lineal
    return days * pricePerDayFallback;
  }
  // Tramo exacto
  const exact = table.find((t) => t.days === days);
  if (exact) return exact.price;

  const min = table[0];
  const max = table[table.length - 1];

  if (days <= min.days) return min.price;

  if (days > max.days) {
    const extra = extraDayPrice && extraDayPrice > 0
      ? extraDayPrice
      : Math.round(max.price / max.days); // fallback: precio promedio del último tramo
    return max.price + (days - max.days) * extra;
  }

  // days está entre dos tramos definidos pero sin fila exacta:
  // usamos el tramo inmediato inferior (más conservador = el cliente paga el del tramo menor cumplido).
  const lower = [...table].reverse().find((t) => t.days <= days) || min;
  return lower.price;
}

export interface QuoteInput {
  destino: Destino;
  serviceType?: ServiceType;
  ingreso: Date;
  retiro: Date;
}

export interface QuoteResult {
  destination: Destino;
  serviceType: ServiceType;
  days: number;
  pricePerDay: number;
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  total: number;
  originalTotal: number;
  savings: number;
  isReferencePrice: boolean;
  externalCheckoutUrl?: string | null;
  description?: string | null;
  /** false → el traslado se cobra aparte por tramo. El total NO lo incluye. */
  transferIncluded: boolean;
  /** ARS por tramo cuando el traslado no está incluido. */
  transferCostPerLeg: number | null;
  /** true → el precio salió de la grilla (no es por día). */
  usedPriceTable: boolean;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; field: string; message: string };

export function calculateDays(ingreso: Date, retiro: Date): number {
  const diffMs = retiro.getTime() - ingreso.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export interface StayBreakdown {
  fullStays: number;        // estadías completas (24h)
  halfStays: number;        // medias estadías (12h)
  totalEquivalent: number;  // fullStays + halfStays * 0.5
  totalHours: number;
}

/**
 * Calcula estadías según regla del operador:
 *  - La primera estadía es indivisible (mínimo 1 aunque sean 4h).
 *  - Después de 24h, cada bloque de hasta 12h adicionales es ½ estadía.
 *  - 2 medias se consolidan automáticamente en 1 completa.
 *
 * Casos validados:
 *   4h  → 1 estadía
 *   13h → 1 estadía
 *   23h → 1 estadía
 *   28h → 1 + ½
 *   36h → 1 + ½
 *   37h → 2 estadías
 *   48h → 2 estadías
 *   49h → 2 + ½
 */
export function calculateStays(ingreso: Date, retiro: Date): StayBreakdown {
  const totalHours = Math.max(0, (retiro.getTime() - ingreso.getTime()) / (1000 * 60 * 60));
  if (totalHours <= 24) {
    return { fullStays: 1, halfStays: 0, totalEquivalent: 1, totalHours };
  }
  const extraHours = totalHours - 24;
  const extraHalves = Math.ceil(extraHours / 12);
  const extraFulls = Math.floor(extraHalves / 2);
  const remainingHalf = extraHalves % 2;
  return {
    fullStays: 1 + extraFulls,
    halfStays: remainingHalf,
    totalEquivalent: 1 + extraFulls + remainingHalf * 0.5,
    totalHours,
  };
}

export function pickDiscount(days: number, discounts: DurationDiscount[] | null | undefined): number {
  if (!discounts || discounts.length === 0) return 0;
  const applicable = discounts
    .filter((d) => days >= d.fromDays)
    .sort((a, b) => b.pctOff - a.pctOff);
  return applicable[0]?.pctOff || 0;
}

export function calculateQuote(input: QuoteInput, rule: PricingRule): QuoteResult {
  const days = calculateDays(input.ingreso, input.retiro);
  const hasTable = Array.isArray(rule.priceTable) && rule.priceTable.length > 0;

  let subtotal: number;
  let discountPct: number;
  let discountAmount: number;
  let total: number;

  if (hasTable) {
    // Grilla de precios: el total sale directo de la tabla. Sin descuento %
    // (la grilla YA es el precio final por tramo).
    total = priceForDays(days, rule.priceTable, rule.extraDayPrice, rule.pricePerDay);
    subtotal = total;
    discountPct = 0;
    discountAmount = 0;
  } else {
    // Modelo lineal: estadías (24 h indivisible + medias estadías) × precio,
    // la misma cuenta con la que se cobra (lib/reservation-total.ts).
    subtotal = Math.round(calculateStays(input.ingreso, input.retiro).totalEquivalent * rule.pricePerDay);
    discountPct = pickDiscount(days, rule.durationDiscounts);
    discountAmount = Math.round((subtotal * discountPct) / 100);
    total = subtotal - discountAmount;
  }

  return {
    destination: rule.destination,
    serviceType: rule.serviceType,
    days,
    pricePerDay: rule.pricePerDay,
    subtotal,
    discountPct,
    discountAmount,
    total,
    originalTotal: subtotal,
    savings: discountAmount,
    isReferencePrice: rule.isReference,
    externalCheckoutUrl: rule.externalCheckoutUrl,
    description: rule.description,
    transferIncluded: rule.transferIncluded !== false,
    transferCostPerLeg: rule.transferIncluded === false ? (rule.transferCostPerLeg ?? null) : null,
    usedPriceTable: hasTable,
  };
}

export function getCandidateServices(destino: Destino): ServiceType[] {
  if (destino === "aeroparque") {
    return ["aeroparque_drop_go", "aeroparque_larga_estadia"];
  }
  if (destino === "ezeiza") {
    return ["ezeiza_larga_estadia"];
  }
  return ["puerto_larga_estadia", "puerto_cruceros"];
}

export interface RecommendationResult {
  recommended: QuoteResult;
  alternatives: QuoteResult[];
}

export function recommendCheapestService(
  input: Omit<QuoteInput, "serviceType">,
  rules: PricingRule[]
): RecommendationResult | null {
  const days = calculateDays(input.ingreso, input.retiro);
  const candidates = getCandidateServices(input.destino);
  const applicable = rules
    .filter((r) => candidates.includes(r.serviceType))
    .filter((r) => {
      if (r.minDays && days < r.minDays) return false;
      if (r.maxDays && days > r.maxDays) return false;
      return true;
    });

  if (applicable.length === 0) return null;

  const quotes = applicable
    .map((r) => calculateQuote({ ...input, serviceType: r.serviceType }, r))
    .sort((a, b) => {
      if (a.total !== b.total) return a.total - b.total;
      if (a.isReferencePrice !== b.isReferencePrice) return a.isReferencePrice ? 1 : -1;
      return 0;
    });

  return { recommended: quotes[0], alternatives: quotes.slice(1) };
}

export interface ValidationOpts {
  minHoursAhead?: number;
  minDays?: number;
  maxDays?: number;
}

export function validateBookingDates(
  ingreso: Date,
  retiro: Date,
  opts: ValidationOpts = {}
): ValidationResult {
  const minHoursAhead = opts.minHoursAhead ?? 0;
  const minDays = opts.minDays ?? 1;
  const maxDays = opts.maxDays ?? 90;

  if (isNaN(ingreso.getTime())) return { ok: false, field: "ingreso", message: "Fecha de ingreso inválida" };
  if (isNaN(retiro.getTime())) return { ok: false, field: "retiro", message: "Fecha de retiro inválida" };
  if (retiro <= ingreso) return { ok: false, field: "retiro", message: "La fecha de retiro debe ser posterior al ingreso" };
  if (minHoursAhead > 0) {
    const minIngreso = new Date(Date.now() + minHoursAhead * 60 * 60 * 1000);
    if (ingreso < minIngreso) return { ok: false, field: "ingreso", message: `La reserva debe hacerse con al menos ${minHoursAhead}hs de anticipación` };
  }
  const days = calculateDays(ingreso, retiro);
  if (days < minDays) return { ok: false, field: "retiro", message: `Mínimo ${minDays} día(s)` };
  if (days > maxDays) return { ok: false, field: "retiro", message: `Máximo ${maxDays} días` };
  return { ok: true };
}

/// Etiqueta visible del destino para UI
export function getDestinoLabel(destino: Destino): string {
  switch (destino) {
    case "aeroparque":
      return "Aeroparque Jorge Newbery";
    case "ezeiza":
      return "Aeropuerto de Ezeiza";
    case "puerto":
      return "Terminal de Cruceros";
  }
}
