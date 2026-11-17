import { Star, ShieldCheck, CreditCard, Bus, MessageCircle, Clock } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { Reveal } from "@/components/ui/Reveal";
import { BookingWidget } from "@/components/booking-widget/BookingWidget";

/**
 * Portada (estilo editorial claro, como Depositos): título grande, cotizador
 * primero, línea de confianza con datos reales y la foto en tarjeta.
 */
export async function Hero() {
  const settings = await getSiteSettings();

  const heroImage = settings.heroImageUrl;
  const heroAlt = settings.heroImageAlt || "Estacionamiento KingPark en BA Ferial (ex Costa Salguero)";
  const customTitle = settings.heroTitle;
  const customSubtitle = settings.heroSubtitle;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <div className="container-main px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Columna texto + cotizador */}
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-soft ring-1 ring-brand-100 sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden="true" />
                BA Ferial (ex Costa Salguero) · Aeroparque y Cruceros
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[clamp(2.5rem,6.2vw,4.75rem)] font-extrabold leading-[1] tracking-[-0.035em] text-brand-950 text-balance">
                {customTitle || (
                  <>
                    Tu auto, en <span className="text-brand-600">buenas manos</span>.
                  </>
                )}
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-700/90 text-pretty sm:text-lg">
                {customSubtitle ||
                  "Dejá el auto en nuestro sector cubierto de BA Ferial y te llevamos a Aeroparque o a la Terminal de Cruceros. Pagás online y te llega el QR al instante."}
              </p>
            </Reveal>

            {/* Cotizador primero */}
            <Reveal delay={180}>
              <div className="mt-7 max-w-2xl overflow-hidden rounded-3xl bg-white shadow-elevated ring-1 ring-brand-100">
                <BookingWidget variant="compact" defaultDestino="aeroparque" entryPoint="home_hero" />
              </div>
            </Reveal>

            {/* Línea de confianza: sólo datos reales */}
            <Reveal delay={240}>
              <ul className="mt-6 flex max-w-2xl flex-wrap gap-x-5 gap-y-2.5 text-sm text-brand-700">
                <li className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                  <strong className="font-semibold text-brand-900">4.8</strong> · +2.000 viajeros
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  Pago online con Mercado Pago
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  Devolución del 100 % hasta 24 h antes
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Bus className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  Traslado ida y vuelta incluido
                </li>
              </ul>
            </Reveal>

            <Reveal delay={300}>
              <a
                href="https://wa.me/5491131606994"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 underline-offset-4 hover:text-brand-800 hover:underline"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                ¿Dudas? Escribinos por WhatsApp, atención 24 h
              </a>
            </Reveal>
          </div>

          {/* Foto en tarjeta, con etiquetas */}
          {heroImage && (
            <Reveal delay={160}>
              <figure className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-elevated ring-1 ring-brand-100 lg:aspect-[4/5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImage} alt={heroAlt} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-950/45 to-transparent" aria-hidden="true" />
                </div>
                <figcaption className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-soft backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
                  Sector cubierto · vigilancia 24 h
                </figcaption>
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-soft backdrop-blur">
                  <Clock className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
                  A 15 minutos de Aeroparque
                </div>
              </figure>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
