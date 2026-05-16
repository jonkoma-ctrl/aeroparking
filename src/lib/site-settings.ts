import { prisma } from "./db";

export interface SiteSettingsData {
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  whatsappPhone: string | null;
  contactEmail: string | null;
}

const DEFAULTS: SiteSettingsData = {
  heroImageUrl:
    "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201400_7a608f99-659e-4589-bb74-d77d945a6b55.png",
  heroImageAlt: "Estacionamiento Aeroparking en Costa Salguero — valet uniformado, sector bajo techo",
  heroTitle: null,
  heroSubtitle: null,
  whatsappPhone: "5491131606994",
  contactEmail: "reservas@nrauditores.com.ar",
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!row) return DEFAULTS;
    return {
      heroImageUrl: row.heroImageUrl ?? DEFAULTS.heroImageUrl,
      heroImageAlt: row.heroImageAlt ?? DEFAULTS.heroImageAlt,
      heroTitle: row.heroTitle ?? DEFAULTS.heroTitle,
      heroSubtitle: row.heroSubtitle ?? DEFAULTS.heroSubtitle,
      whatsappPhone: row.whatsappPhone ?? DEFAULTS.whatsappPhone,
      contactEmail: row.contactEmail ?? DEFAULTS.contactEmail,
    };
  } catch {
    return DEFAULTS;
  }
}
