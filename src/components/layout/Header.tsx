"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Eventos", href: "/valet-eventos" },
  { label: "FAQ", href: "/#faq" },
];

const bookingOptions = [
  { label: "Aeroparque", href: "/reservar/aeroparque" },
  { label: "Ezeiza", href: "/reservar/ezeiza" },
  { label: "Terminal de Cruceros", href: "/reservar/puerto" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/95 backdrop-blur-sm">
      <div className="container-main flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-extrabold tracking-tight text-brand-900">
            AERO<span className="text-brand-500">PARKING</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-900"
            >
              {item.label}
            </Link>
          ))}

          {/* Booking dropdown */}
          <div className="relative">
            <button
              onClick={() => setBookingOpen(!bookingOpen)}
              onBlur={() => setTimeout(() => setBookingOpen(false), 200)}
              className="flex items-center gap-1 rounded-lg bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Reservar ahora
              <ChevronDown className="h-4 w-4" />
            </button>
            {bookingOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-brand-200 bg-white py-2 shadow-lg">
                {bookingOptions.map((opt) => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    className="block px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50"
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-brand-100 bg-white md:hidden">
          <nav className="container-main flex flex-col gap-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-brand-100 pt-2">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-400">
                Reservar
              </p>
              {bookingOptions.map((opt) => (
                <Link
                  key={opt.href}
                  href={opt.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
