/** Cookie de la página de resultado: guarda qué reserva y qué pago mostrar. */
export const RESULT_COOKIE = "kp_resultado";
export const RESULT_PATH = "/reservar/resultado";

export function serializeResultCookie(id: string | null, paymentId: string | null): string | null {
  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return null;
  const payment = paymentId && /^\d{1,32}$/.test(paymentId) ? paymentId : "";
  return `${id}.${payment}`;
}

export function parseResultCookie(value: string | undefined): { id: string; paymentId: string } | null {
  if (!value) return null;
  const [id, paymentId = ""] = value.split(".");
  if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id) || !/^\d{0,32}$/.test(paymentId)) return null;
  return { id, paymentId };
}
