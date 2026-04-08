"use client";

import { useState } from "react";
import { formatDate, getStatusLabel, getStatusColor, getServiceTypeLabel, formatPrice } from "@/lib/utils";

interface ReservationData {
  type: string;
  id: string;
  externalOrderId?: string;
  customerName: string;
  destination?: string;
  serviceType?: string;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  startDate?: string;
  endDate?: string;
  departureDate?: string;
  returnDate?: string;
  departureFlightDate?: string;
  departureAirline?: string;
  departureFlight?: string;
  arrivalAirline?: string;
  arrivalFlight?: string;
  price?: number;
  status: string;
  arrivalTime?: string;
  passengers?: number;
  cruiseLine?: string;
  createdAt: string;
}

export default function MiReservaPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ReservationData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setData(null);

    const param = query.match(/^[a-z]/) ? `id=${query}` : `order=${query}`;
    const res = await fetch(`/api/mi-reserva?${param}`);
    const json = await res.json();

    if (res.ok) {
      setData(json);
    } else {
      setError(json.error || "No encontrada");
    }
    setLoading(false);
  }

  const start = data?.startDate || data?.departureDate;
  const end = data?.endDate || data?.returnDate;

  return (
    <div className="section-padding">
      <div className="container-main max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-brand-900">
          Mi Reserva
        </h1>
        <p className="mb-6 text-sm text-brand-500">
          Ingresá tu número de pedido para ver el estado de tu reserva.
        </p>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: 177666"
            className="flex-1 rounded-lg border border-brand-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-lg bg-brand-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {loading ? "..." : "Buscar"}
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-900">
                {data.externalOrderId ? `Pedido #${data.externalOrderId}` : `Reserva`}
              </h2>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(data.status)}`}
              >
                {getStatusLabel(data.status)}
              </span>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-500">Cliente</dt>
                <dd className="font-medium text-brand-900">{data.customerName}</dd>
              </div>
              {data.destination && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Destino</dt>
                  <dd className="font-medium text-brand-900">
                    {data.destination === "aeroparque" ? "Aeroparque" : "Puerto de BA"}
                  </dd>
                </div>
              )}
              {data.serviceType && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Servicio</dt>
                  <dd className="font-medium text-brand-900">
                    {getServiceTypeLabel(data.serviceType)}
                  </dd>
                </div>
              )}
              {data.cruiseLine && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Naviera</dt>
                  <dd className="font-medium text-brand-900">{data.cruiseLine}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-brand-500">Vehículo</dt>
                <dd className="font-medium text-brand-900">
                  {data.licensePlate} — {data.carBrand} {data.carModel}
                </dd>
              </div>
              {start && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Ingreso</dt>
                  <dd className="font-medium text-brand-900">
                    {formatDate(start)}
                  </dd>
                </div>
              )}
              {(data.departureAirline || data.departureFlight) && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Vuelo salida</dt>
                  <dd className="font-medium text-brand-900">
                    {[data.departureAirline, data.departureFlight].filter(Boolean).join(" ")}
                    {data.departureFlightDate && ` — ${formatDate(data.departureFlightDate)}`}
                  </dd>
                </div>
              )}
              {end && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Retiro</dt>
                  <dd className="font-medium text-brand-900">
                    {formatDate(end)}
                    {data.arrivalTime && ` — ${data.arrivalTime} hs`}
                  </dd>
                </div>
              )}
              {(data.arrivalAirline || data.arrivalFlight) && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Vuelo arribo</dt>
                  <dd className="font-medium text-brand-900">
                    {[data.arrivalAirline, data.arrivalFlight].filter(Boolean).join(" ")}
                  </dd>
                </div>
              )}
              {data.passengers && data.passengers > 0 && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Pasajeros</dt>
                  <dd className="font-medium text-brand-900">{data.passengers}</dd>
                </div>
              )}
              {data.price != null && data.price > 0 && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Precio</dt>
                  <dd className="font-medium text-brand-900">
                    {formatPrice(data.price)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
