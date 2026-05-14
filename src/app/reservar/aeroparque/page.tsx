import { redirect } from "next/navigation";

export default function ReservarAeroparquePage() {
  redirect("/reservar?destino=aeroparque");
}
