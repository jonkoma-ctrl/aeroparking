import type { Metadata } from "next";
import { Archivo, Bricolage_Grotesque, Manrope } from "next/font/google";
import { BRAND_NAME } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MobileStickyCTA } from "@/components/layout/MobileStickyCTA";
import { Analytics } from "@/components/analytics/Analytics";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Letras del logo (casilleros KINGPARK): Archivo condensada.
const logo = Archivo({
  subsets: ["latin"],
  variable: "--font-logo",
  axes: ["wdth"],
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Estacionamiento y traslado a Aeroparque y Cruceros`,
  description:
    "Dejá el auto en BA Ferial (ex Costa Salguero) y te llevamos a Aeroparque o a la Terminal de Cruceros. Traslado ida y vuelta incluido, pago online, atención 24 horas.",
  keywords: [
    "parking aeroparque",
    "valet parking aeroparque",
    "estacionamiento aeroparque",
    "parking cruceros buenos aires",
    "traslado terminal cruceros",
    "estacionamiento costa salguero",
  ],
  openGraph: {
    title: `${BRAND_NAME} — Parking y Traslados`,
    description:
      "Estacionamiento en BA Ferial con traslado a Aeroparque y a la Terminal de Cruceros.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${logo.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
        <MobileStickyCTA />
        <Analytics />
      </body>
    </html>
  );
}
