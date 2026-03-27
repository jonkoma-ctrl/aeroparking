import Link from "next/link";
import {
  Ship,
  Check,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  BadgePercent,
  TrendingDown,
} from "lucide-react";

export function CruiseService() {
  return (
    <section id="puerto" className="section-padding bg-gradient-to-b from-white to-violet-50/30">
      <div className="container-main">
        {/* Section header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <Ship className="h-4 w-4" />
            Puerto de Buenos Aires
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Larga Estadía + Shuttle
          </h2>
          <p className="mt-3 text-brand-500">
            Dejá tu auto en Costa Salguero, lo guardamos seguro. Al volver de tu crucero,
            el shuttle te trae de vuelta.{" "}
            <strong className="text-accent-600">Mejor precio garantizado.</strong>
          </p>
        </div>

        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl shadow-xl">
          <div className="grid lg:grid-cols-2">
            {/* Left — Image */}
            <div className="relative">
              <img
                src="https://www.cronista.com/resizer/v2/L3YSXJLA2JCINILIDSFOXV6KPE.jpg?auth=507cbc1ca9b88afd772181a0ffb9349a408709904b339198a2d4a533db0b409c&height=899&width=1200&quality=70&smart=true"
                alt="Puerto de Buenos Aires"
                className="h-full min-h-[300px] w-full object-cover lg:min-h-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-950/80 via-violet-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-violet-950/20" />

              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-bold text-brand-950 shadow-lg">
                <TrendingDown className="h-3.5 w-3.5" />
                Mejor precio del mercado
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
                <h3 className="text-2xl font-extrabold text-white">Larga Estadía Cruceros</h3>
                <p className="mt-1 text-sm text-violet-200">Parking en Costa Salguero + Shuttle de vuelta</p>
              </div>
            </div>

            {/* Right — Info + CTA */}
            <div className="flex flex-col justify-center bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 p-8 text-white md:p-10">
              <h3 className="hidden text-2xl font-extrabold lg:block">
                ¿Salís de crucero?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-violet-200">
                Traé tu auto a nuestro parking en Costa Salguero, lo guardamos seguro mientras disfrutás tu crucero. Al volver, tomás nuestro shuttle hasta tu vehículo.
              </p>

              {/* Travel time badge */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-2">
                <Clock className="h-4 w-4 text-accent-400" />
                <span className="text-xs font-semibold text-white">
                  A solo 10 min del Puerto
                </span>
              </div>

              {/* Steps */}
              <div className="mt-6 space-y-3">
                {[
                  "Traés tu auto a Costa Salguero",
                  "Lo guardamos seguro en nuestro parking",
                  "Disfrutá tu crucero tranquilo",
                  "Al volver, shuttle te lleva a tu auto (10 min)",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-violet-100">{text}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="mt-5 space-y-2">
                {[
                  "Parking vigilado 24hs con cámaras",
                  "Shuttle incluido (10 min al puerto)",
                  "Estadías flexibles",
                  "Atención personalizada",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-violet-200">
                    <Check className="h-3.5 w-3.5 text-accent-400" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Trust badges */}
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl bg-white/10 p-3">
                {[
                  { icon: ShieldCheck, label: "Seguro incluido" },
                  { icon: MapPin, label: "Shuttle incluido" },
                  { icon: Clock, label: "Vigilancia 24hs" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                    <item.icon className="h-5 w-5 text-accent-400" />
                    <span className="text-[10px] text-violet-200">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/reservar/cruceros"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-violet-700 shadow-xl transition-all hover:bg-accent-50 hover:scale-[1.02]"
              >
                Reservar ahora
                <ArrowRight className="h-5 w-5" />
              </Link>

              <p className="mt-3 text-center text-[11px] text-violet-300">
                Sin cargo hasta confirmar. Reserva sujeta a disponibilidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
