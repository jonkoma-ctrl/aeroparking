/**
 * Devuelve la URL canónica del sitio, siempre absoluta (https://...).
 *
 * Prioridad:
 *  1. NEXT_PUBLIC_SITE_URL — si está seteada Y NO es localhost (defensa contra
 *     env vars mal configuradas en producción). Si viene sin protocolo
 *     ("aeroparking.vercel.app"), se le antepone https:// — un valor sin
 *     protocolo genera hrefs relativos en los emails, que los clientes de
 *     correo resuelven contra rutas locales (link roto).
 *  2. VERCEL_PROJECT_PRODUCTION_URL — auto-inyectada por Vercel en producción.
 *  3. https://aeroparking.vercel.app — fallback seguro.
 */
export function getSiteUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";

  let fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    // Normalizar: sin protocolo → https://
    if (!/^https?:\/\//i.test(fromEnv)) {
      fromEnv = `https://${fromEnv}`;
    }
    // En producción ignoramos valores que apunten a localhost (env var mal cargada).
    if (isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(fromEnv)) {
      // Caer al siguiente fallback
    } else {
      return fromEnv.replace(/\/$/, "");
    }
  }

  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProdUrl) {
    return `https://${vercelProdUrl}`;
  }

  return "https://aeroparking.vercel.app";
}
