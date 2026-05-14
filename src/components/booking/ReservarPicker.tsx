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

interface Props {
  destinations: DestinationMeta[];
  initialSlug: string;
}

export function ReservarPicker({ destinations, initialSlug }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const selected = destinations.find((d) => d.slug === selectedSlug) ?? destinations[0];

  const picker = (
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
      {selected.description && (
        <p className="mt-3 text-xs leading-relaxed text-brand-500">{selected.description}</p>
      )}
    </div>
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
