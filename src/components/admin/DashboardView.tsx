"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import type { DeltaKPIBlock, DayBucket, DestinationBucket } from "@/lib/dashboard-stats";
import { Calendar, TrendingUp, TrendingDown, Car, AlertTriangle, XCircle } from "lucide-react";

interface Props {
  kpis: DeltaKPIBlock;
  byDay: DayBucket[];
  byDest: DestinationBucket[];
  destinations: { slug: string; label: string }[];
  from: string;
  to: string;
  destFilter: string;
  statusFilter: string;
}

const DESTINATION_COLORS = ["#3b82f6", "#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e"];

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos los estados" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "checked_in", label: "En sede" },
  { value: "completed", label: "Completadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "no_show", label: "No show" },
];

export function DashboardView({
  kpis,
  byDay,
  byDest,
  destinations,
  from,
  to,
  destFilter,
  statusFilter,
}: Props) {
  const router = useRouter();
  const [pendingFrom, setPendingFrom] = useState(from);
  const [pendingTo, setPendingTo] = useState(to);
  const [pendingDest, setPendingDest] = useState(destFilter);
  const [pendingStatus, setPendingStatus] = useState(statusFilter);

  function applyFilters() {
    const p = new URLSearchParams();
    if (pendingFrom) p.set("from", pendingFrom);
    if (pendingTo) p.set("to", pendingTo);
    if (pendingDest && pendingDest !== "todos") p.set("dest", pendingDest);
    if (pendingStatus && pendingStatus !== "todos") p.set("status", pendingStatus);
    router.push(`/admin/dashboard?${p.toString()}`);
  }

  function exportUrl() {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (destFilter && destFilter !== "todos") p.set("dest", destFilter);
    if (statusFilter && statusFilter !== "todos") p.set("status", statusFilter);
    return `/api/admin/export?${p.toString()}`;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Dashboard</h1>
        <p className="text-sm text-brand-500">
          Resumen de {from} a {to}
          {destFilter !== "todos" && ` · destino: ${destFilter}`}
          {statusFilter !== "todos" && ` · estado: ${statusFilter}`}
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 rounded-xl border border-brand-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">Desde</label>
            <input
              type="date"
              value={pendingFrom}
              onChange={(e) => setPendingFrom(e.target.value)}
              className="rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">Hasta</label>
            <input
              type="date"
              value={pendingTo}
              onChange={(e) => setPendingTo(e.target.value)}
              className="rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">Destino</label>
            <select
              value={pendingDest}
              onChange={(e) => setPendingDest(e.target.value)}
              className="rounded border border-brand-200 px-3 py-2 text-sm"
            >
              <option value="todos">Todos</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">Estado</label>
            <select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value)}
              className="rounded border border-brand-200 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={applyFilters}
            className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            Aplicar
          </button>
          <a
            href={exportUrl()}
            className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            📥 Exportar CSV
          </a>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Reservas en el período"
          value={String(kpis.totalReservations)}
          delta={kpis.deltaReservations}
          icon={Calendar}
        />
        <KpiCard
          label="Facturación"
          value={formatPrice(kpis.totalRevenue)}
          delta={kpis.deltaRevenue}
          icon={TrendingUp}
        />
        <KpiCard
          label="Ticket promedio"
          value={kpis.totalReservations > 0 ? formatPrice(kpis.averageTicket) : "—"}
          delta={kpis.deltaTicket}
          icon={TrendingUp}
        />
        <KpiCard
          label="Autos en sede hoy"
          value={String(kpis.carsOnSite)}
          icon={Car}
          accent="emerald"
        />
        <KpiCard
          label="No-show rate"
          value={`${(kpis.noShowRate * 100).toFixed(1)}%`}
          icon={AlertTriangle}
          accent="amber"
        />
        <KpiCard
          label="Cancelación rate"
          value={`${(kpis.cancelRate * 100).toFixed(1)}%`}
          icon={XCircle}
          accent="rose"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reservas por día */}
        <div className="rounded-xl border border-brand-200 bg-white p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-brand-900">Reservas por día</h3>
          {byDay.length === 0 ? (
            <p className="py-12 text-center text-sm text-brand-400">Sin datos en el rango.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byDay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => [
                      name === "revenue" ? formatPrice(Number(value) || 0) : value,
                      name === "revenue" ? "Facturación" : "Reservas",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Reservas"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Donut por destino */}
        <div className="rounded-xl border border-brand-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-brand-900">Por destino</h3>
          {byDest.length === 0 ? (
            <p className="py-12 text-center text-sm text-brand-400">Sin datos.</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byDest}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {byDest.map((_, i) => (
                        <Cell key={i} fill={DESTINATION_COLORS[i % DESTINATION_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`${value} reservas`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {byDest.map((d, i) => (
                  <li key={d.destination} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: DESTINATION_COLORS[i % DESTINATION_COLORS.length] }}
                      />
                      <span className="text-brand-700">{d.label}</span>
                    </span>
                    <span className="font-mono text-xs text-brand-500">
                      {d.count} · {d.pct.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Tabla revenue por destino */}
      {byDest.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-brand-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50 text-left text-xs uppercase text-brand-500">
              <tr>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3 text-right">Reservas</th>
                <th className="px-4 py-3 text-right">%</th>
                <th className="px-4 py-3 text-right">Facturación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {byDest.map((d) => (
                <tr key={d.destination}>
                  <td className="px-4 py-3 font-medium text-brand-900">{d.label}</td>
                  <td className="px-4 py-3 text-right font-mono">{d.count}</td>
                  <td className="px-4 py-3 text-right font-mono text-brand-500">
                    {d.pct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{formatPrice(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number | null;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "default" | "emerald" | "amber" | "rose";
}

function KpiCard({ label, value, delta, icon: Icon, accent = "default" }: KpiCardProps) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-600 bg-emerald-50"
      : accent === "amber"
      ? "text-amber-600 bg-amber-50"
      : accent === "rose"
      ? "text-rose-600 bg-rose-50"
      : "text-brand-600 bg-brand-50";

  return (
    <div className="rounded-xl border border-brand-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-brand-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta !== undefined && delta !== null && (
        <p className={`mt-2 text-xs font-medium ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs período anterior
        </p>
      )}
      {delta === null && (
        <p className="mt-2 text-xs text-brand-400">Sin datos previos comparables</p>
      )}
    </div>
  );
}
