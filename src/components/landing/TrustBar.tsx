import { ShieldCheck, Camera, UserCheck, Truck, Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Banda de confianza horizontal. Va después del cotizador.
 * Stagger reveal de cada item para sensación "vivo".
 */
export function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "Seguro incluido", sub: "Tu auto cubierto" },
    { icon: Camera, label: "Cámaras 24h", sub: "Sector privado" },
    { icon: UserCheck, label: "Personal propio", sub: "Empleados uniformados" },
    { icon: Truck, label: "Traslado garantizado", sub: "Vehículos propios" },
    { icon: Star, label: "+2.000 viajeros", sub: "Recomendados" },
  ];

  return (
    <section className="border-y border-brand-100 bg-white py-8 sm:py-10">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i * 60}>
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:gap-3">
                <div className="mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-all hover:bg-accent-50 hover:text-accent-700 hover:ring-accent-200 sm:mb-0">
                  <it.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-brand-900">{it.label}</div>
                  <div className="text-[11px] leading-snug text-brand-500 sm:text-xs">{it.sub}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
