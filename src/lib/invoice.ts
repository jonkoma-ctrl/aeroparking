/**
 * Datos para factura A que el cliente carga al reservar. El sitio no emite la
 * factura: Border's la hace desde su sistema con lo que queda en la reserva.
 */
const CUIT_PREFIXES = /^(20|23|24|25|26|27|30|33|34)/;
const CUIT_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

export function normalizeCuit(value: string): string {
  return value.replace(/\D/g, "");
}

/** Controla largo, tipo de contribuyente y dígito verificador. */
export function isValidCuit(value: string): boolean {
  const digits = normalizeCuit(value);
  if (!/^\d{11}$/.test(digits) || !CUIT_PREFIXES.test(digits)) return false;
  const sum = CUIT_WEIGHTS.reduce((acc, weight, i) => acc + weight * Number(digits[i]), 0);
  const rest = 11 - (sum % 11);
  const check = rest === 11 ? 0 : rest === 10 ? 9 : rest;
  return check === Number(digits[10]);
}

export function formatCuit(value: string): string {
  const d = normalizeCuit(value);
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

export function cleanBusinessName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** La razón social termina en el mail interno: no se aceptan marcas HTML. */
export function isValidBusinessName(value: string): boolean {
  const name = cleanBusinessName(value);
  return name.length >= 3 && name.length <= 120 && !/[<>]/.test(name);
}

/** Pedido de factura A primero, para que se vea al abrir la reserva. */
export function withInvoiceANote(
  notes: string | null | undefined,
  invoice: { cuit: string; businessName: string } | null,
): string | null {
  const clientNotes = notes?.trim() || null;
  if (!invoice) return clientNotes;
  const line = `FACTURA A — CUIT ${formatCuit(invoice.cuit)} — Razón social: ${cleanBusinessName(invoice.businessName)}`;
  return clientNotes ? `${line}\n---\n${clientNotes}` : line;
}
