"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Barra fija inferior en mobile con CTA principal. Se muestra después de
 * scrollear el primer viewport (Hero). Mejora conversión >40% según
 * benchmarks de booking en mobile.
 *
 * Se oculta cuando estás cerca del WhatsApp button para no tapar.
 */
export function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handle() {
      // Aparece después de scrollear ~70% del viewport inicial
      const threshold = window.innerHeight * 0.7;
      setVisible(window.scrollY > threshold);
    }
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 print:hidden border-t border-brand-200 bg-white px-4 py-3 shadow-elevated transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link
        href="/reservar"
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cta-gradient py-3 text-sm font-bold text-brand-950 shadow-cta transition-all hover:shadow-cta-hover active:scale-[0.98]"
      >
        Reservar ahora
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
