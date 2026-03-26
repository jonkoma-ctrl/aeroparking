import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Parking y Traslados | Aeroparque & Cruceros`,
  description:
    "Servicio de estacionamiento y traslados para Aeroparque Jorge Newbery y Terminal de Cruceros de Buenos Aires. Valet parking, larga estadía y transfer al puerto.",
  keywords: [
    "parking aeroparque",
    "valet parking aeroparque",
    "estacionamiento aeroparque",
    "larga estadia aeroparque",
    "parking cruceros buenos aires",
    "traslado terminal cruceros",
    "estacionamiento costa salguero",
  ],
  openGraph: {
    title: `${BRAND_NAME} — Parking y Traslados`,
    description:
      "Estacionamiento seguro y traslados para Aeroparque y Terminal de Cruceros.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
