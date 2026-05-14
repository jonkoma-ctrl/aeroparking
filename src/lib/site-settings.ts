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
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLRRz6M8aujZyPeO9sj5UATUV_oNdGTojo_yBYG2zAuyQVoKq533RQEf4ak08pWbvo1sy7MvzQ7S6DBuv3vxu3cawTYYp2JSFL5-NEk18MGkhLEjud1Bdq_F-90i_S54uB9BflYGsPdKFVBU3-k-fMOxNhz-HePsZUox5PdG6IehaV8lk5Z6DJkmUY9Pk/s1600/IMG-20240710-WA0038.jpg",
  heroImageAlt: "Estacionamiento Aeroparking en Costa Salguero",
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
