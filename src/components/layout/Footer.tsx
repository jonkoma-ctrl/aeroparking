import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-950 text-brand-300">
      <div className="container-main section-padding">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="https://www.alicanteairportcarparking.com/img/logo.webp"
                alt="AEROPARKING"
                className="h-9 w-auto brightness-0 invert"
              />
              <span className="text-xl font-extrabold tracking-tight text-white">
                AERO<span className="text-brand-400">PARKING</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-brand-400">
              Valet &middot; Estacionamiento &middot; Traslados
              <br />
              Aeropuerto &amp; Puerto de BA
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Servicios
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/servicios/valet-parking"
                  className="transition-colors hover:text-white"
                >
                  Valet Parking Aeroparque
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/larga-estadia"
                  className="transition-colors hover:text-white"
                >
                  Larga Estadía Aeroparque
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios/terminal-cruceros"
                  className="transition-colors hover:text-white"
                >
                  Puerto de Buenos Aires
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
              <li>Buenos Aires, Argentina</li>
              <li>
                <a href="mailto:reservas@nrauditores.com.ar" className="transition-colors hover:text-white">
                  reservas@nrauditores.com.ar
                </a>
              </li>
              <li>
                <a href="https://wa.me/5491131606994" className="transition-colors hover:text-white">
                  11-3160-6994
                </a>
                {" / "}
                <a href="https://wa.me/5491153228770" className="transition-colors hover:text-white">
                  11-5322-8770
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-800 pt-6 text-center text-xs text-brand-500">
          &copy; 2026 By JonKoma
        </div>
      </div>
    </footer>
  );
}
