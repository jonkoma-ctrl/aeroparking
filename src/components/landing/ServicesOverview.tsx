import Link from "next/link";
import { SERVICES } from "@/lib/constants";
import { Car, Clock, Ship, ArrowRight } from "lucide-react";

const iconMap = {
  car: Car,
  clock: Clock,
  ship: Ship,
} as const;

const serviceColors = {
  valet: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-100",
    badge: "bg-blue-100 text-blue-700",
  },
  longStay: {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    border: "border-emerald-100",
    badge: "bg-emerald-100 text-emerald-700",
  },
  cruises: {
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    border: "border-violet-100",
    badge: "bg-violet-100 text-violet-700",
  },
} as const;

export function ServicesOverview() {
  const services = [
    { key: "valet" as const, data: SERVICES.valet },
    { key: "longStay" as const, data: SERVICES.longStay },
    { key: "cruises" as const, data: SERVICES.cruises },
  ];

  return (
    <section id="servicios" className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Nuestros servicios
          </h2>
          <p className="mt-4 text-lg text-brand-500">
            Tres opciones pensadas para que tu viaje empiece sin
            complicaciones.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {services.map(({ key, data }) => {
            const Icon = iconMap[data.icon];
            const colors = serviceColors[key];

            return (
              <div
                key={key}
                className={`group relative rounded-2xl border ${colors.border} ${colors.bg} p-8 transition-all hover:shadow-lg`}
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg}`}
                >
                  <Icon className={`h-6 w-6 ${colors.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-brand-900">
                  {data.shortName}
                </h3>
                <p className="mt-1 text-sm font-medium text-brand-500">
                  {data.tagline}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-brand-600">
                  {data.description}
                </p>

                <ul className="mt-5 space-y-2">
                  {data.features.slice(0, 3).map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-brand-700"
                    >
                      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${colors.iconBg}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={data.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-900 transition-colors hover:text-accent-600"
                >
                  Más información
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
