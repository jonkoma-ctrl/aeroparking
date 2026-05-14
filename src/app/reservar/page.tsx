import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listActiveDestinations } from "@/lib/destinos";
import { BRAND_NAME } from "@/lib/constants";
import { ReservarPicker } from "@/components/booking/ReservarPicker";

export const metadata: Metadata = {
  title: `Reservar — ${BRAND_NAME}`,
  description:
    "Reservá tu estacionamiento en Costa Salguero con traslado al destino que elijas: Aeroparque, Ezeiza o Terminal de Cruceros.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ destino?: string }>;
}

export default async function ReservarPage({ searchParams }: PageProps) {
  const { destino } = await searchParams;
  const destinations = await listActiveDestinations();

  if (destinations.length === 0) {
    redirect("/");
  }

  // Si el query param matchea, lo pre-seleccionamos; si no, el primero.
  const selectedSlug = destinations.find((d) => d.slug === destino)?.slug ?? destinations[0].slug;

  return <ReservarPicker destinations={destinations} initialSlug={selectedSlug} />;
}
