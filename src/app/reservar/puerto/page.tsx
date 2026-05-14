import { redirect } from "next/navigation";

export default function ReservarPuertoPage() {
  redirect("/reservar?destino=puerto");
}
