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
  checkInTime?: string;
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
  const [showCancel, setShowCancel] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [actionReason, setActionReason] = useState("");
  const [extendDate, setExtendDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [quoteInfo, setQuoteInfo] = useState<{ extraDays: number; pricePerDay: number; extensionCost: number } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  async function fetchQuote(date: string) {
    if (!data?.externalOrderId || !date) { setQuoteInfo(null); return; }
    setQuoteLoading(true);
    const res = await fetch(`/api/mi-reserva/quote?order=${data.externalOrderId}&newEndDate=${date}`);
    if (res.ok) {
      setQuoteInfo(await res.json());
    } else {
      setQuoteInfo(null);
    }
    setQuoteLoading(false);
  }

  async function handleCancel() {
    if (!data?.externalOrderId) return;
    setActionLoading(true);
    const res = await fetch("/api/mi-reserva/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalOrderId: data.externalOrderId, reason: actionReason }),
    });
    if (res.ok) {
      setData({ ...data, status: "cancellation_requested" });
      setShowCancel(false);
      setActionReason("");
    }
    setActionLoading(false);
  }

  async function handleExtend() {
    if (!data?.externalOrderId || !extendDate) return;
    setActionLoading(true);
    const res = await fetch("/api/mi-reserva/extend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ externalOrderId: data.externalOrderId, newEndDate: extendDate, reason: actionReason }),
    });
    if (res.ok) {
      setData({ ...data, status: "extension_requested" });
      setShowExtend(false);
      setActionReason("");
      setExtendDate("");
    }
    setActionLoading(false);
  }

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
              {(start || data.departureAirline || data.departureFlight) && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Salida</dt>
                  <dd className="text-right font-medium text-brand-900">
                    <div>
                      {start && formatDate(start)}
                      {data.checkInTime && ` — ${data.checkInTime} hs`}
                    </div>
                    {(data.departureAirline || data.departureFlight) && (
                      <div className="text-xs text-brand-500">
                        {[data.departureAirline, data.departureFlight].filter(Boolean).join(" ")}
                      </div>
                    )}
                  </dd>
                </div>
              )}
              {(end || data.arrivalAirline || data.arrivalFlight) && (
                <div className="flex justify-between">
                  <dt className="text-brand-500">Arribo</dt>
                  <dd className="text-right font-medium text-brand-900">
                    <div>
                      {end && formatDate(end)}
                      {data.arrivalTime && ` — ${data.arrivalTime} hs`}
                    </div>
                    {(data.arrivalAirline || data.arrivalFlight) && (
                      <div className="text-xs text-brand-500">
                        {[data.arrivalAirline, data.arrivalFlight].filter(Boolean).join(" ")}
                      </div>
                    )}
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

            {/* Action buttons */}
            {data.status === "confirmed" && (
              <div className="mt-6 space-y-3 border-t border-brand-100 pt-6">
                {/* Extend — only Puerto */}
                {data.destination === "puerto" && !showExtend && (
                  <button
                    onClick={() => setShowExtend(true)}
                    className="w-full rounded-lg border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                  >
                    Extender estadía
                  </button>
                )}
                {showExtend && (
                  <div className="space-y-2 rounded-lg border border-brand-200 p-4">
                    <label className="block text-xs text-brand-500">Nueva fecha de retiro</label>
                    <input
                      type="date"
                      value={extendDate}
                      onChange={(e) => { setExtendDate(e.target.value); fetchQuote(e.target.value); }}
                      min={end ? new Date(new Date(end).getTime() + 86400000).toISOString().split("T")[0] : ""}
                      className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm"
                    />
                    {quoteLoading && (
                      <p className="text-xs text-brand-400">Calculando precio...</p>
                    )}
                    {quoteInfo && quoteInfo.extensionCost > 0 && (
                      <div className="rounded-md bg-purple-50 border border-purple-200 p-3 text-sm">
                        <p className="font-medium text-purple-800">
                          {quoteInfo.extraDays} día{quoteInfo.extraDays !== 1 ? "s" : ""} extra → {formatPrice(quoteInfo.extensionCost)}
                        </p>
                        <p className="text-xs text-purple-600">
                          {formatPrice(quoteInfo.pricePerDay)} por día
                        </p>
                      </div>
                    )}
                    {quoteInfo && quoteInfo.pricePerDay === 0 && (
                      <p className="text-xs text-brand-400">Tarifa no configurada — nos contactaremos para presupuestar</p>
                    )}
                    <label className="block text-xs text-brand-500">Motivo</label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Ej: vuelo demorado, extensión de viaje..."
                      className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleExtend}
                        disabled={actionLoading || !extendDate}
                        className="flex-1 rounded-lg bg-brand-900 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
                      >
                        {actionLoading ? "..." : "Solicitar extensión"}
                      </button>
                      <button
                        onClick={() => { setShowExtend(false); setActionReason(""); setExtendDate(""); }}
                        className="rounded-lg px-3 py-2 text-sm text-brand-500 hover:text-brand-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancel */}
                {!showCancel && (
                  <button
                    onClick={() => setShowCancel(true)}
                    className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Solicitar cancelación
                  </button>
                )}
                {showCancel && (
                  <div className="space-y-2 rounded-lg border border-red-200 p-4">
                    <label className="block text-xs text-brand-500">Motivo de cancelación</label>
                    <textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Ej: cambio de planes, error en la reserva..."
                      className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading ? "..." : "Confirmar cancelación"}
                      </button>
                      <button
                        onClick={() => { setShowCancel(false); setActionReason(""); }}
                        className="rounded-lg px-3 py-2 text-sm text-brand-500 hover:text-brand-700"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status messages */}
            {data.status === "cancellation_requested" && (
              <div className="mt-6 rounded-lg bg-orange-50 border border-orange-200 p-4 text-sm text-orange-700">
                Tu solicitud de cancelación fue recibida. Te contactaremos pronto.
              </div>
            )}
            {data.status === "extension_requested" && (
              <div className="mt-6 rounded-lg bg-purple-50 border border-purple-200 p-4 text-sm text-purple-700">
                Tu solicitud de extensión fue recibida. Te contactaremos para confirmar y coordinar el pago.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
