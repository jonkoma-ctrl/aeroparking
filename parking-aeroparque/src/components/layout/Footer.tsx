import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";
import { Car } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-950 text-brand-300">
      <div className="container-main section-padding">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800">
                <Car className="h-4 w-4 text-accent-400" />
              </div>
              <span className="text-lg font-bold text-white">{BRAND_NAME}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-400">
              Parking seguro y traslados para Aeroparque Jorge Newbery y
              Terminal de Cruceros de Buenos Aires.
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
                  Terminal de Cruceros
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
              <li>info@aeroparking.com.ar</li>
              <li>+54 11 XXXX-XXXX</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-800 pt-6 text-center text-xs text-brand-500">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
