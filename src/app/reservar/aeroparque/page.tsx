import { PresentialBookingForm } from "@/components/booking/PresentialBookingForm";
import { BRAND_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Reservar — Aeroparque | ${BRAND_NAME}`,
  description:
    "Reservá tu estacionamiento en Costa Salguero con traslado incluido a Aeroparque Jorge Newbery. Pago presencial al dejar el vehículo. Atención 24 horas.",
};

export default function ReservarAeroparquePage() {
  return <PresentialBookingForm destino="aeroparque" />;
}
