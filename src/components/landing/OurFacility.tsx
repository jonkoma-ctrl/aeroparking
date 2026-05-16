import { Camera, Truck, UserCheck } from "lucide-react";

/**
 * Sección visual del lugar real. Muestra fotos de la operación —
 * sector cubierto, furgoneta de traslado, personal recibiendo.
 * Genera confianza tangible (vs. iconografía abstracta).
 */
const photos = [
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201448_2e8f18c6-fbde-475d-9de8-c4c65b41f850.png",
    alt: "Sector cubierto de estacionamiento con cámaras de seguridad",
    icon: Camera,
    label: "Sector cubierto",
    sub: "Vigilancia 24h con cámaras",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201434_4ea87a18-d30f-42d0-bf34-902166bd4d97.png",
    alt: "Personal uniformado recibiendo al cliente al llegar",
    icon: UserCheck,
    label: "Recepción personalizada",
    sub: "Personal propio uniformado",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201414_bc793123-9149-4c3e-866c-7acf19d24d04.png",
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
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Conocé nuestra sede
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 text-balance sm:text-4xl lg:text-5xl">
            Costa Salguero, frente al río
          </h2>
          <p className="mt-3 text-base text-brand-600 sm:text-lg">
            Sector cubierto y privado, vigilancia las 24 horas, personal uniformado y vehículos propios para el traslado. Así trabajamos.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {photos.map((photo) => (
            <figure
              key={photo.label}
              className="group relative overflow-hidden rounded-2xl shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/30 to-transparent" />
              {/* Caption */}
              <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                <div className="mb-1 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-400/95 text-brand-950 shadow-soft backdrop-blur-sm">
                  <photo.icon className="h-4 w-4" />
                </div>
                <div className="font-display text-base font-extrabold text-white">{photo.label}</div>
                <div className="text-xs text-brand-200">{photo.sub}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Address card */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center sm:p-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
            Dónde estamos
          </p>
          <p className="mt-1 font-display text-lg font-bold text-brand-900 sm:text-xl">
            Av. Costanera Rafael Obligado · Costa Salguero · CABA
          </p>
          <p className="mt-2 text-sm text-brand-600">
            A 4 km de Aeroparque · A 3 km del Puerto · A 40 km de Ezeiza
          </p>
          <a
            href="https://maps.app.goo.gl/kZQH9UpSa5zGYxY5A"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white shadow-soft transition-all hover:bg-brand-800 hover:scale-[1.02]"
          >
            Ver en Google Maps →
          </a>
        </div>
      </div>
    </section>
  );
}
