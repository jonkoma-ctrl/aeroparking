import Link from "next/link";
import { CONTACT } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-950 text-brand-300">
      <div className="container-main section-padding">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center">
              <span className="text-xl font-extrabold tracking-tight text-white">
                AERO<span className="text-brand-400">PARKING</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-400">
              Estacionamiento &middot; Traslados &middot; Valet
              <br />
              Aeroparque &middot; Ezeiza &middot; Cruceros
            </p>
          </div>

          {/* Destinos */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Destinos
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/reservar/aeroparque"
                  className="transition-colors hover:text-white"
                >
                  Aeroparque Jorge Newbery
                </Link>
              </li>
              <li>
                <Link
                  href="/reservar/ezeiza"
                  className="transition-colors hover:text-white"
                >
                  Aeropuerto de Ezeiza
                </Link>
              </li>
              <li>
                <Link
                  href="/reservar/puerto"
                  className="transition-colors hover:text-white"
                >
                  Terminal de Cruceros
                </Link>
              </li>
              <li>
                <Link
                  href="/valet-eventos"
                  className="transition-colors hover:text-white"
                >
                  Valet para eventos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm">
              <li>{CONTACT.address}</li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="transition-colors hover:text-white"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  className="transition-colors hover:text-white"
                >
                  {CONTACT.phone}
                </a>
              </li>
              <li className="text-xs text-brand-500">Atención las 24 horas</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-800 pt-6 text-center text-xs text-brand-500">
          &copy; 2026 AEROPARKING
        </div>
      </div>
    </footer>
  );
}
