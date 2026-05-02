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
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; field: string; message: string };

export function calculateDays(ingreso: Date, retiro: Date): number {
  const diffMs = retiro.getTime() - ingreso.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
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
  const subtotal = days * rule.pricePerDay;
  const discountPct = pickDiscount(days, rule.durationDiscounts);
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmount;

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
