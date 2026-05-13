export type Destino = "aeroparque" | "puerto" | "ezeiza";

export type ServiceType =
  | "aeroparque_drop_go"
  | "aeroparque_larga_estadia"
  | "puerto_larga_estadia"
  | "puerto_cruceros"
  | "ezeiza_larga_estadia";

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

export interface PricingRule {
  id?: string;
  destination: Destino;
  serviceType: ServiceType;
  pricePerDay: number;          // Semánticamente: precio por estadía completa (24h)
  isReference: boolean;
  externalCheckoutUrl?: string | null;
  minDays?: number | null;
  maxDays?: number | null;
  durationDiscounts?: DurationDiscount[] | null;
  description?: string | null;
  transferIncluded?: boolean;
  transferCostPerLeg?: number | null;
}

export interface QuoteInput {
  destino: Destino;
  serviceType?: ServiceType;
  ingreso: Date;
  retiro: Date;
  transferLegs?: number;        // 0, 1, o 2 (solo Ezeiza)
}

export interface StayBreakdown {
  fullStays: number;
  halfStays: number;
  totalEquivalent: number;      // fullStays + halfStays * 0.5
  totalHours: number;
}

export interface QuoteResult {
  destination: Destino;
  serviceType: ServiceType;
  // Estadías
  fullStays: number;
  halfStays: number;
  totalStays: number;
  pricePerStay: number;
  parkingSubtotal: number;
  // Traslado
  transferIncluded: boolean;
  transferLegs: number;
  transferCostPerLeg: number;
  transferSubtotal: number;
  // Total
  subtotal: number;             // parking + transfer (antes de descuento)
  discountPct: number;
  discountAmount: number;
  total: number;
  originalTotal: number;
  savings: number;
  // Compatibilidad (deprecated)
  days: number;                 // Math.ceil(totalStays)
  pricePerDay: number;          // = pricePerStay
  // Metadata
  isReferencePrice: boolean;
  externalCheckoutUrl?: string | null;
  description?: string | null;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; field: string; message: string };

/**
 * Calcula estadías según regla del operador:
 * - Mínimo: 1 estadía (cualquier tiempo ≤ 24h)
 * - Después de 24h: cada bloque de hasta 12hs = ½ estadía
 * - 2 medias se consolidan en 1 completa
 *
 * Ejemplos:
 *  4h  → 1 estadía
 *  23h → 1 estadía
 *  28h → 1 + ½ ($60k)
 *  36h → 1 + ½ ($60k)
 *  37h → 2 ($80k)
 *  48h → 2
 *  49h → 2 + ½ ($100k)
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

// Mantengo calculateDays para compatibilidad (deprecated)
export function calculateDays(ingreso: Date, retiro: Date): number {
  const stays = calculateStays(ingreso, retiro);
  return Math.ceil(stays.totalEquivalent);
}

export function pickDiscount(equivalentDays: number, discounts: DurationDiscount[] | null | undefined): number {
  if (!discounts || discounts.length === 0) return 0;
  const applicable = discounts
    .filter((d) => equivalentDays >= d.fromDays)
    .sort((a, b) => b.pctOff - a.pctOff);
  return applicable[0]?.pctOff || 0;
}

export function calculateQuote(input: QuoteInput, rule: PricingRule): QuoteResult {
  const stays = calculateStays(input.ingreso, input.retiro);
  const pricePerStay = rule.pricePerDay; // Mismo valor, semántica nueva

  const parkingSubtotal = Math.round(stays.totalEquivalent * pricePerStay);

  // Traslado
  const transferIncluded = rule.transferIncluded !== false;
  const transferCostPerLeg = rule.transferCostPerLeg || 0;
  const requestedLegs = input.transferLegs ?? 0;
  const transferLegs = transferIncluded ? 0 : requestedLegs;
  const transferSubtotal = transferLegs * transferCostPerLeg;

  const subtotal = parkingSubtotal + transferSubtotal;

  // Descuento (aplica solo sobre parking, no sobre traslado)
  const discountPct = pickDiscount(stays.totalEquivalent, rule.durationDiscounts);
  const discountAmount = Math.round((parkingSubtotal * discountPct) / 100);
  const total = subtotal - discountAmount;

  return {
    destination: rule.destination,
    serviceType: rule.serviceType,
    fullStays: stays.fullStays,
    halfStays: stays.halfStays,
    totalStays: stays.totalEquivalent,
    pricePerStay,
    parkingSubtotal,
    transferIncluded,
    transferLegs,
    transferCostPerLeg,
    transferSubtotal,
    subtotal,
    discountPct,
    discountAmount,
    total,
    originalTotal: subtotal,
    savings: discountAmount,
    days: Math.ceil(stays.totalEquivalent),
    pricePerDay: pricePerStay,
    isReferencePrice: rule.isReference,
    externalCheckoutUrl: rule.externalCheckoutUrl,
    description: rule.description,
  };
}

export function getCandidateServices(destino: Destino): ServiceType[] {
  if (destino === "aeroparque") {
    return ["aeroparque_drop_go", "aeroparque_larga_estadia"];
  }
  if (destino === "puerto") {
    return ["puerto_larga_estadia", "puerto_cruceros"];
  }
  return ["ezeiza_larga_estadia"];
}

export interface RecommendationResult {
  recommended: QuoteResult;
  alternatives: QuoteResult[];
}

export function recommendCheapestService(
  input: Omit<QuoteInput, "serviceType">,
  rules: PricingRule[]
): RecommendationResult | null {
  const stays = calculateStays(input.ingreso, input.retiro);
  const equivalentDays = stays.totalEquivalent;
  const candidates = getCandidateServices(input.destino);
  const applicable = rules
    .filter((r) => candidates.includes(r.serviceType))
    .filter((r) => {
      if (r.minDays && equivalentDays < r.minDays) return false;
      if (r.maxDays && equivalentDays > r.maxDays) return false;
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
  const minDays = opts.minDays ?? 0;
  const maxDays = opts.maxDays ?? 90;

  if (isNaN(ingreso.getTime())) return { ok: false, field: "ingreso", message: "Fecha de ingreso inválida" };
  if (isNaN(retiro.getTime())) return { ok: false, field: "retiro", message: "Fecha de retiro inválida" };
  if (retiro <= ingreso) return { ok: false, field: "retiro", message: "La fecha de retiro debe ser posterior al ingreso" };
  if (minHoursAhead > 0) {
    const minIngreso = new Date(Date.now() + minHoursAhead * 60 * 60 * 1000);
    if (ingreso < minIngreso) return { ok: false, field: "ingreso", message: `La reserva debe hacerse con al menos ${minHoursAhead}hs de anticipación` };
  }
  const stays = calculateStays(ingreso, retiro);
  if (minDays > 0 && stays.totalEquivalent < minDays) return { ok: false, field: "retiro", message: `Mínimo ${minDays} estadía(s)` };
  if (stays.totalEquivalent > maxDays) return { ok: false, field: "retiro", message: `Máximo ${maxDays} estadías` };
  return { ok: true };
}
