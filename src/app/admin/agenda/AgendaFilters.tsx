"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface Props {
  currentService?: string;
  currentStatus?: string;
  currentDate?: string;
}

export function AgendaFilters({ currentService, currentStatus, currentDate }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/agenda?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/admin/agenda");
  }

  const hasFilters = currentService || currentStatus || currentDate;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
      <Filter className="h-4 w-4 text-brand-400" />

      <select
        value={currentService || "all"}
        onChange={(e) => updateFilter("service", e.target.value)}
        className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm text-brand-700 focus:border-brand-400 focus:outline-none"
      >
        <option value="all">Todos los servicios</option>
        <option value="drop_go">Drop & Go</option>
        <option value="larga_estadia">Larga Estadía</option>
        <option value="cruceros">Cruceros</option>
      </select>

      <select
        value={currentStatus || "all"}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm text-brand-700 focus:border-brand-400 focus:outline-none"
      >
        <option value="all">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="confirmed">Confirmada</option>
        <option value="completed">Completada</option>
        <option value="cancelled">Cancelada</option>
        <option value="no_show">No se presentó</option>
      </select>

      <input
        type="date"
        value={currentDate || ""}
        onChange={(e) => updateFilter("date", e.target.value)}
        className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm text-brand-700 focus:border-brand-400 focus:outline-none"
      />

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm text-brand-500 hover:bg-brand-50"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
