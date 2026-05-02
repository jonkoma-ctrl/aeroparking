import { PresentialBookingForm } from "@/components/booking/PresentialBookingForm";
import { BRAND_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Reservar — Ezeiza | ${BRAND_NAME}`,
  description:
    "Reservá tu estacionamiento en Costa Salguero con traslado incluido al Aeropuerto de Ezeiza. Pago presencial al dejar el vehículo. Atención 24 horas.",
};

export default function ReservarEzeizaPage() {
  return <PresentialBookingForm destino="ezeiza" />;
}
