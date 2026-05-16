import { ShieldCheck, Camera, UserCheck, Truck, Star } from "lucide-react";

/**
 * Banda de confianza horizontal. Va después del cotizador.
 * Comunica los 5 valores clave que un airport parking tiene que transmitir.
 */
export function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "Seguro incluido", sub: "Tu auto cubierto desde que llega" },
    { icon: Camera, label: "Cámaras 24h", sub: "Sector privado monitoreado" },
    { icon: UserCheck, label: "Personal uniformado", sub: "Empleados propios, no terceros" },
    { icon: Truck, label: "Traslado garantizado", sub: "Vehículos propios siempre disponibles" },
    { icon: Star, label: "+2.000 viajeros", sub: "Recomendados por nuestros clientes" },
  ];

  return (
    <section className="border-y border-brand-100 bg-white py-8">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((it) => (
            <div key={it.label} className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-3">
              <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 sm:mb-0">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-brand-900">{it.label}</div>
                <div className="text-[11px] leading-snug text-brand-500 sm:text-xs">{it.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
