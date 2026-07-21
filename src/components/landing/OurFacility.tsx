import { Camera, Truck, UserCheck, MapPin } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Sección visual del lugar real. Layout asimétrico para romper el grid
 * uniforme: foto grande a la izquierda + 2 chicas apiladas a la derecha.
 */
const heroPhoto = {
  url: "https://sdpvjoczsukegmpi.public.blob.vercel-storage.com/facility/sector-cubierto.png",
  alt: "Sector cubierto de estacionamiento con cámaras de seguridad",
  icon: Camera,
  label: "Sector cubierto",
  sub: "Vigilancia 24h con cámaras",
};

const sidePhotos = [
  {
    url: "https://sdpvjoczsukegmpi.public.blob.vercel-storage.com/facility/recepcion-valet.png",
    alt: "Personal recibiendo al cliente al llegar",
    icon: UserCheck,
    label: "Recepción personalizada",
    sub: "Personal propio uniformado",
  },
  {
    url: "https://sdpvjoczsukegmpi.public.blob.vercel-storage.com/facility/furgoneta-traslado.png",
    alt: "Furgoneta de traslado al aeropuerto cargando equipaje",
    icon: Truck,
    label: "Traslado en vehículos propios",
    sub: "Sin esperas, sin sorpresas",
  },
];

export function OurFacility() {
  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              Conocé nuestra sede
            </p>
            <h2 className="font-display text-huge-2 text-brand-900 text-balance">
              BA Ferial (ex Costa Salguero), frente al río
            </h2>
            <p className="mt-4 text-base text-brand-600 text-pretty sm:text-lg">
              Sector cubierto y privado, vigilancia 24 horas, personal uniformado, vehículos propios para el traslado. Así trabajamos.
            </p>
          </div>
        </Reveal>

        {/* Asymmetric grid: 1 big + 2 stacked */}
        <div className="mt-14 grid gap-5 lg:grid-cols-5 lg:gap-6">
          <Reveal className="lg:col-span-3">
            <PhotoCard photo={heroPhoto} aspect="aspect-[4/3] lg:aspect-[5/4]" />
          </Reveal>

          <div className="grid gap-5 lg:col-span-2 lg:gap-6">
            {sidePhotos.map((photo, i) => (
              <Reveal key={photo.label} delay={120 + i * 100}>
                <PhotoCard photo={photo} aspect="aspect-[4/3] lg:aspect-[5/3]" />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Address card — asimétrico, left-aligned content */}
        <Reveal delay={300}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-50 sm:mt-14">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-3 lg:gap-8 lg:p-10">
              <div className="lg:col-span-2">
                <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
                  <MapPin className="h-3.5 w-3.5" />
                  Dónde estamos
                </div>
                <p className="font-display text-2xl font-bold text-brand-900 sm:text-3xl">
                  Av. Costanera Rafael Obligado
                  <br />
                  <span className="text-brand-600">BA Ferial · CABA</span>
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4 sm:max-w-md">
                  <DistanceItem distance="4 km" to="Aeroparque" />
                  <DistanceItem distance="3 km" to="Puerto" />
                  <DistanceItem distance="40 km" to="Ezeiza" />
                </div>
              </div>
              <div className="flex items-end justify-start lg:items-center lg:justify-end">
                <a
                  href="https://maps.app.goo.gl/kZQH9UpSa5zGYxY5A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:scale-[1.02]"
                >
                  Ver en Google Maps
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

interface PhotoCardProps {
  photo: {
    url: string;
    alt: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    sub: string;
  };
  aspect: string;
}

function PhotoCard({ photo, aspect }: PhotoCardProps) {
  const Icon = photo.icon;
  return (
    <figure className="group relative h-full overflow-hidden rounded-2xl shadow-soft transition-all duration-500 hover:shadow-elevated hover:-translate-y-1">
      <div className={`${aspect} overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.alt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/40 to-transparent" />
      <figcaption className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-400/95 text-brand-950 shadow-soft backdrop-blur-sm transition-transform group-hover:scale-110">
          <Icon className="h-4 w-4" />
        </div>
        <div className="font-display text-base font-extrabold text-white sm:text-lg">
          {photo.label}
        </div>
        <div className="text-xs text-brand-200">{photo.sub}</div>
      </figcaption>
    </figure>
  );
}

function DistanceItem({ distance, to }: { distance: string; to: string }) {
  return (
    <div className="border-l-2 border-accent-400 pl-3">
      <div className="font-display text-lg font-extrabold text-brand-900">{distance}</div>
      <div className="text-xs text-brand-600">a {to}</div>
    </div>
  );
}
