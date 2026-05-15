/**
 * Devuelve la URL canónica del sitio.
 *
 * Prioridad:
 *  1. NEXT_PUBLIC_SITE_URL — si está seteada Y NO es localhost (defensa contra
 *     env vars mal configuradas en producción).
 *  2. VERCEL_PROJECT_PRODUCTION_URL — auto-inyectada por Vercel en builds de producción.
 *  3. https://aeroparking.vercel.app — fallback seguro.
 *
 * En dev local, esta función devuelve el default — los emails generados en dev
 * van a usar la URL pública, no localhost. Si querés testear contra localhost,
 * seteá NEXT_PUBLIC_SITE_URL en tu .env.local con "http://localhost:3000" y la
 * función la respeta (solo en runtime de dev — en producción la ignora).
 */
export function getSiteUrl(): string {
  const isProduction = process.env.NODE_ENV === "production";

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
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
