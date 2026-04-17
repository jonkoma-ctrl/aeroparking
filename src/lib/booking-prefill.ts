import type { ServiceType } from "./pricing";

export interface PrefillPayload {
  s: ServiceType;
  i: string; // ingreso ISO
  r: string; // retiro ISO
  v?: string; // vehicle
}

function base64urlEncode(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  }
  return btoa(str).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  if (typeof window === "undefined") {
    return Buffer.from(padded, "base64").toString();
  }
  return atob(padded);
}

export function encodePrefill(payload: PrefillPayload): string {
  return base64urlEncode(JSON.stringify(payload));
}

export function decodePrefill(encoded: string): PrefillPayload | null {
  try {
    const json = base64urlDecode(encoded);
    const parsed = JSON.parse(json);
    if (!parsed.s || !parsed.i || !parsed.r) return null;
    // Basic validation
    if (isNaN(new Date(parsed.i).getTime())) return null;
    if (isNaN(new Date(parsed.r).getTime())) return null;
    return parsed as PrefillPayload;
  } catch {
    return null;
  }
}
