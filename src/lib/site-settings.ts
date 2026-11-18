import { prisma } from "./db";

export interface SiteSettingsData {
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  whatsappPhone: string | null;
  contactEmail: string | null;
  reviewUrl: string | null;
}

// Foto vieja de la portada, con logos de terceros. Si quedó guardada en la base,
// se reemplaza por la actual; cualquier otra foto cargada desde el panel se respeta.
const OLD_HERO_URL =
  "https://sdpvjoczsukegmpi.public.blob.vercel-storage.com/hero/costa-salguero-valet.png";

const DEFAULTS: SiteSettingsData = {
  heroImageUrl: "/fotos/portada-kingpark.jpg",
  heroImageAlt: "Estacionamiento KingPark en BA Ferial (ex Costa Salguero) — valet uniformado, sector bajo techo",
  heroTitle: null,
  heroSubtitle: null,
  whatsappPhone: "5491131606994",
  contactEmail: "reservas@nrauditores.com.ar",
  reviewUrl: null,
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!row) return DEFAULTS;
    return {
      heroImageUrl:
        row.heroImageUrl && row.heroImageUrl !== OLD_HERO_URL ? row.heroImageUrl : DEFAULTS.heroImageUrl,
      heroImageAlt: row.heroImageAlt ?? DEFAULTS.heroImageAlt,
      heroTitle: row.heroTitle ?? DEFAULTS.heroTitle,
      heroSubtitle: row.heroSubtitle ?? DEFAULTS.heroSubtitle,
      whatsappPhone: row.whatsappPhone ?? DEFAULTS.whatsappPhone,
      contactEmail: row.contactEmail ?? DEFAULTS.contactEmail,
      reviewUrl: row.reviewUrl ?? DEFAULTS.reviewUrl,
    };
  } catch {
    return DEFAULTS;
  }
}
