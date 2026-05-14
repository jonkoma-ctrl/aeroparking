import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { BRAND_NAME } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Parking y Traslados | Aeroparque & Cruceros`,
  description:
    "Servicio de estacionamiento y traslados para Aeroparque Jorge Newbery, Ezeiza y Terminal de Cruceros de Buenos Aires. Traslado incluido, atención 24 horas.",
  keywords: [
    "parking aeroparque",
    "valet parking aeroparque",
    "estacionamiento aeroparque",
    "estacionamiento ezeiza",
    "parking cruceros buenos aires",
    "traslado terminal cruceros",
    "estacionamiento costa salguero",
  ],
  openGraph: {
    title: `${BRAND_NAME} — Parking y Traslados`,
    description:
      "Estacionamiento seguro y traslados para Aeroparque, Ezeiza y Terminal de Cruceros.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
