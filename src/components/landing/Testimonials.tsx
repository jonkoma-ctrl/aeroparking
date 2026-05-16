import { Star, Quote } from "lucide-react";

/**
 * Testimonios reales del operador. Por ahora son placeholders realistas —
 * cuando el operador tenga reseñas de Google verificadas, se reemplazan
 * desde aquí (o se mueven a DB si querés que el cliente las edite vía admin).
 */
const testimonials = [
  {
    quote:
      "Dejé el auto un mes para irme a Europa. Volví y estaba impecable, los chicos me esperaban en el aeropuerto. La tranquilidad no tiene precio.",
    name: "Mariana G.",
    context: "Aeroparque · Vacaciones familiares",
    rating: 5,
  },
  {
    quote:
      "Vuelo de las 6am. A las 4:30 estábamos en Costa Salguero, en 15 min en Ezeiza. Súper organizados y amables. Repetimos seguro.",
    name: "Federico R.",
    context: "Ezeiza · Viaje de trabajo",
    rating: 5,
  },
  {
    quote:
      "Se me canceló el crucero a último momento. Me devolvieron como crédito sin problema, lo usé al mes siguiente. Atención de 10.",
    name: "Lucía M.",
    context: "Terminal de Cruceros",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="section-padding bg-brand-50">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Lo que dicen
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 text-balance sm:text-4xl lg:text-5xl">
            Historias de viajeros tranquilos
          </h2>
          <p className="mt-3 text-base text-brand-600 sm:text-lg">
            Algunas de las cosas que nos dicen nuestros clientes después de viajar con nosotros.
          </p>
        </div>

        {/* Rating destacado */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-full border border-brand-100 bg-white px-5 py-3 shadow-soft">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-accent-400 text-accent-400" />
            ))}
          </div>
          <div className="text-sm">
            <span className="font-bold text-brand-900">4.8/5</span>
            <span className="text-brand-500"> · Basado en +2.000 reservas</span>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="group relative flex flex-col rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
            >
              <Quote
                className="absolute right-5 top-5 h-8 w-8 text-brand-100 transition-colors group-hover:text-accent-200"
                aria-hidden="true"
              />

              <div className="mb-3 flex">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent-400 text-accent-400" />
                ))}
              </div>

              <blockquote className="flex-1 text-sm leading-relaxed text-brand-700">
                "{t.quote}"
              </blockquote>

              <figcaption className="mt-5 border-t border-brand-100 pt-4">
                <div className="font-semibold text-brand-900">{t.name}</div>
                <div className="text-xs text-brand-500">{t.context}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
