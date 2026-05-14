"use client";

import { useState } from "react";
import { Plane, Ship, Bus, Car, Train, MapPin } from "lucide-react";
import type { DestinationMeta } from "@/lib/destinos";
import type { Destino } from "@/lib/pricing";
import { PresentialBookingForm } from "./PresentialBookingForm";

const ICON_BY_KEY: Record<string, typeof Plane> = {
  plane: Plane,
  ship: Ship,
  bus: Bus,
  car: Car,
  train: Train,
};

const ACCENT_BG: Record<string, string> = {
  blue: "bg-blue-50 border-blue-400 text-blue-700",
  sky: "bg-sky-50 border-sky-400 text-sky-700",
  violet: "bg-violet-50 border-violet-400 text-violet-700",
  amber: "bg-amber-50 border-amber-400 text-amber-700",
  emerald: "bg-emerald-50 border-emerald-400 text-emerald-700",
  rose: "bg-rose-50 border-rose-400 text-rose-700",
  indigo: "bg-indigo-50 border-indigo-400 text-indigo-700",
};

const GRADIENT_BY_COLOR: Record<string, string> = {
  blue: "from-blue-600 to-blue-900",
  sky: "from-sky-600 to-sky-900",
  violet: "from-violet-600 to-violet-900",
  amber: "from-amber-500 to-amber-800",
  emerald: "from-emerald-600 to-emerald-900",
  rose: "from-rose-600 to-rose-900",
  indigo: "from-indigo-600 to-indigo-900",
};

interface Props {
  destinations: DestinationMeta[];
  initialSlug: string;
}

export function ReservarPicker({ destinations, initialSlug }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const selected = destinations.find((d) => d.slug === selectedSlug) ?? destinations[0];

  const SelectedIcon = ICON_BY_KEY[selected.iconKey] ?? Plane;
  const selectedGradient = GRADIENT_BY_COLOR[selected.accentColor] ?? GRADIENT_BY_COLOR.blue;

  const picker = (
    <>
      {/* Hero card del destino seleccionado */}
      <div className="mb-4 overflow-hidden rounded-2xl shadow-sm">
        <div className="relative aspect-[16/9] sm:aspect-[21/9]">
          {selected.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.imageUrl}
              alt={selected.imageAlt || selected.label}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${selectedGradient}`}>
              <SelectedIcon className="absolute right-6 top-6 h-24 w-24 text-white/20" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          {/* Label */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
              <SelectedIcon className="h-3 w-3" />
              Destino seleccionado
            </div>
            <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {selected.label}
            </h2>
            {selected.description && (
              <p className="mt-1 max-w-xl text-sm text-white/80 sm:text-base">
                {selected.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Picker chips */}
      <div className="mb-6 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-500">
          <MapPin className="h-4 w-4" />
          ¿A dónde vas?
        </div>
        <div className={`grid gap-2 ${destinations.length <= 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
          {destinations.map((d) => {
            const Icon = ICON_BY_KEY[d.iconKey] ?? Plane;
            const isSelected = d.slug === selectedSlug;
            const accent = ACCENT_BG[d.accentColor] ?? ACCENT_BG.blue;
            return (
              <button
                key={d.slug}
                type="button"
                onClick={() => setSelectedSlug(d.slug)}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
                  isSelected
                    ? accent
                    : "border-brand-200 bg-white text-brand-600 hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{d.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <PresentialBookingForm
      key={selected.slug}
      destino={selected.slug as Destino}
      destinationMeta={selected}
      headerSlot={picker}
    />
  );
}
