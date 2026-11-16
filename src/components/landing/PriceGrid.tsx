import Link from "next/link";
import { ArrowRight, Check, Plane, Ship } from "lucide-react";
import { prisma } from "@/lib/db";
import { listActiveDestinations } from "@/lib/destinos";
import { priceForDays, type PriceTier } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

// Tramos que mostramos en la portada. Los precios salen de la tarifa vigente
// del panel (Tarifas), con la misma cuenta que se usa para cobrar.
const SHOWN_DAYS = [1, 3, 5, 7, 10, 14];

interface Card {
  slug: string;
  label: string;
  isShip: boolean;
  rows: { days: number; total: number; perDay: number }[];
  fromPerDay: number;
}

async function loadCards(): Promise<Card[]> {
  const destinations = await listActiveDestinations();
  const cards: Card[] = [];
  for (const d of destinations) {
    const isShip = d.iconKey === "ship";
    // Mismo servicio que usa el formulario de reserva para cada destino.
    const serviceType = isShip ? "cruceros" : "larga_estadia";
    const tariff = await prisma.servicePricing.findFirst({
      where: { destination: d.slug, serviceType, active: true },
    });
    if (!tariff) continue;
    const table = (tariff.priceTable as PriceTier[] | null) || null;
    const rows = SHOWN_DAYS.map((days) => {
      const total = priceForDays(days, table, tariff.extraDayPrice, tariff.pricePerDay);
      return { days, total, perDay: Math.round(total / days) };
    }).filter((r) => r.total > 0);
    if (rows.length === 0) continue;
    cards.push({
      slug: d.slug,
      label: d.label,
      isShip,
      rows,
      fromPerDay: Math.min(...rows.map((r) => r.perDay)),
    });
  }
  return cards;
}

export async function PriceGrid() {
  const cards = await loadCards();
  if (cards.length === 0) return null;

  return (
    <section id="tarifas" className="section-padding bg-white">
      <div className="container-main">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">Tarifas</p>
            <h2 className="font-display text-huge-2 text-brand-900 text-balance">
              El precio, a la vista
            </h2>
            <p className="mt-4 text-base text-brand-600 text-pretty sm:text-lg">
              Lo que ves es lo que pagás. Incluye el estacionamiento en BA Ferial y el traslado ida y vuelta.
            </p>
          </div>
        </Reveal>

        <div className={`mx-auto mt-12 grid gap-6 ${cards.length > 1 ? "max-w-5xl lg:grid-cols-2" : "max-w-xl"}`}>
          {cards.map((c, i) => {
            const Icon = c.isShip ? Ship : Plane;
            return (
              <Reveal key={c.slug} delay={i * 100}>
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-elevated">
                  <div className="bg-brand-900 px-6 py-6 sm:px-8">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
                      <Icon className="h-4 w-4" />
                      {c.label}
                    </div>
                    <p className="mt-3 text-sm text-brand-200">Desde</p>
                    <p className="font-display text-4xl font-extrabold tabular-nums text-white">
                      {formatPrice(c.fromPerDay)}
                      <span className="ml-1 text-base font-semibold text-brand-300">/ día</span>
                    </p>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-brand-400">
                        <th className="px-6 py-3 font-semibold sm:px-8">Estadía</th>
                        <th className="px-3 py-3 text-right font-semibold">Total</th>
                        <th className="px-6 py-3 text-right font-semibold sm:px-8">Por día</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.rows.map((r) => (
                        <tr key={r.days} className="border-b border-brand-50 last:border-0">
                          <td className="px-6 py-3 font-medium text-brand-900 sm:px-8">
                            {r.days} {r.days === 1 ? "día" : "días"}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold tabular-nums text-brand-900">
                            {formatPrice(r.total)}
                          </td>
                          <td className="px-6 py-3 text-right tabular-nums text-brand-500 sm:px-8">
                            {formatPrice(r.perDay)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-auto space-y-4 border-t border-brand-100 bg-brand-50/60 px-6 py-5 sm:px-8">
                    <ul className="space-y-1.5 text-sm text-brand-700">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Traslado ida y vuelta incluido</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Pago online con Mercado Pago</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> QR por mail apenas pagás</li>
                    </ul>
                    <Link
                      href={`/reservar?destino=${c.slug}`}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cta-gradient px-6 py-3 text-sm font-bold text-brand-950 shadow-cta transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                    >
                      Reservar {c.isShip ? "Cruceros" : c.label.split(" ")[0]}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-brand-400">
          Estadías de 24 h. Para otras duraciones, el cotizador te muestra el precio exacto antes de pagar.
        </p>
      </div>
    </section>
  );
}
