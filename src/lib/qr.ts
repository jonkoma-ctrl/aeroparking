import QRCode from "qrcode";
import { customAlphabet } from "nanoid";
import { getSiteUrl } from "./site-url";

// Alfabeto sin caracteres ambiguos (0/O, 1/I/L) — el código es tipeable a mano
// como fallback si la cámara no lee el QR.
const nano = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

/** Genera un token corto único para el QR (6 chars, sin ambiguos). */
export function generateQrToken(): string {
  return nano();
}

/** URL pública que encoda el QR — se abre con cualquier cámara. */
export function qrUrl(token: string): string {
  return `${getSiteUrl()}/validar/${token}`;
}

/**
 * Genera el PNG del QR como Buffer (para adjuntar al email vía cid inline).
 * Encoda la URL /validar/{token} con color brand azul.
 */
export async function qrPngBuffer(token: string): Promise<Buffer> {
  return QRCode.toBuffer(qrUrl(token), {
    type: "png",
    width: 320,
    margin: 2,
    color: { dark: "#1e3a8a", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

/** Genera el QR como data URL (para render inline en HTML/web). */
export async function qrDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(qrUrl(token), {
    width: 320,
    margin: 2,
    color: { dark: "#1e3a8a", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}
