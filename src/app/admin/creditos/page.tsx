"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Credit {
  id: string;
  email: string;
  amountAvailable: number;
  reason: string | null;
  sourceReservationId: string | null;
  usedReservationId: string | null;
  status: string;
  usedAt: string | null;
  createdAt: string;
}

export default function CreditosPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", amountAvailable: "", reason: "", sourceReservationId: "" });

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filterEmail) qs.set("email", filterEmail);
    if (filterStatus) qs.set("status", filterStatus);
    const res = await fetch(`/api/admin/credits?${qs.toString()}`);
    const data = await res.json();
    setCredits(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createCredit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.amountAvailable) return;
    await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ email: "", amountAvailable: "", reason: "", sourceReservationId: "" });
    setShowForm(false);
    load();
  }

  async function markStatus(id: string, status: string) {
    await fetch("/api/admin/credits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  const totalAvailable = credits.filter(c => c.status === "available").reduce((a, c) => a + c.amountAvailable, 0);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Créditos a clientes</h1>
          <p className="text-sm text-brand-500">Crédito disponible total: <strong>{formatPrice(totalAvailable)}</strong></p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800">
          {showForm ? "Cancelar" : "+ Nuevo crédito"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCredit} className="mb-6 rounded-xl border border-brand-200 bg-white p-5 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input required type="email" placeholder="Email del cliente" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="rounded border border-brand-200 px-3 py-2 text-sm" />
            <input required type="number" placeholder="Monto (ARS)" value={form.amountAvailable}
              onChange={e => setForm({ ...form, amountAvailable: e.target.value })}
              className="rounded border border-brand-200 px-3 py-2 text-sm" />
          </div>
          <input placeholder="Reserva origen (opcional)" value={form.sourceReservationId}
            onChange={e => setForm({ ...form, sourceReservationId: e.target.value })}
            className="w-full rounded border border-brand-200 px-3 py-2 text-sm" />
          <textarea placeholder="Motivo (ej: vuelo cancelado)" value={form.reason}
            onChange={e => setForm({ ...form, reason: e.target.value })}
            className="w-full rounded border border-brand-200 px-3 py-2 text-sm" rows={2} />
          <button type="submit" className="rounded bg-brand-900 px-4 py-2 text-sm text-white">Crear crédito</button>
        </form>
      )}

      <div className="mb-4 flex gap-2">
        <input placeholder="Filtrar por email" value={filterEmail}
          onChange={e => setFilterEmail(e.target.value)}
          className="flex-1 rounded border border-brand-200 px-3 py-2 text-sm" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="rounded border border-brand-200 px-3 py-2 text-sm">
          <option value="">Todos</option>
          <option value="available">Disponible</option>
          <option value="used">Usado</option>
          <option value="expired">Expirado</option>
        </select>
        <button onClick={load} className="rounded bg-brand-100 px-4 py-2 text-sm text-brand-700">Filtrar</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50 text-left text-xs uppercase text-brand-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-400">Cargando...</td></tr>
            ) : credits.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-400">Sin créditos</td></tr>
            ) : credits.map(c => (
              <tr key={c.id} className="hover:bg-brand-50">
                <td className="px-4 py-3 font-medium text-brand-900">{c.email}</td>
                <td className="px-4 py-3 font-mono">{formatPrice(c.amountAvailable)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === "available" ? "bg-green-100 text-green-800" :
                    c.status === "used" ? "bg-gray-100 text-gray-600" :
                    "bg-red-100 text-red-700"
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-brand-500 max-w-xs truncate">{c.reason || "—"}</td>
                <td className="px-4 py-3 text-xs text-brand-400">{new Date(c.createdAt).toLocaleDateString("es-AR")}</td>
                <td className="px-4 py-3">
                  {c.status === "available" && (
                    <div className="flex gap-1">
                      <button onClick={() => markStatus(c.id, "used")}
                        className="rounded bg-brand-100 px-2 py-1 text-xs text-brand-700 hover:bg-brand-200">Marcar usado</button>
                      <button onClick={() => markStatus(c.id, "expired")}
                        className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100">Expirar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
