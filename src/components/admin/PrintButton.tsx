"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-soft transition hover:bg-brand-50"
    >
      <Printer className="h-4 w-4" />
      Imprimir
    </button>
  );
}
