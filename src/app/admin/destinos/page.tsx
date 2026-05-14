"use client";

import { useEffect, useState } from "react";

interface Destination {
  id: string;
  slug: string;
  label: string;
  shortLabel: string;
  iconKey: string;
  accentColor: string;
  description: string | null;
  addressInfo: string | null;
  active: boolean;
  sortOrder: number;
}

const ICONS = ["plane", "ship", "bus", "car", "train"];
const COLORS = ["blue", "sky", "violet", "amber", "emerald", "rose", "indigo"];

export default function DestinosPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState({
    slug: "",
    label: "",
    shortLabel: "",
    iconKey: "plane",
    accentColor: "blue",
    description: "",
    addressInfo: "",
    sortOrder: "100",
  });
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/destinations");
    const data = await res.json();
    setDestinations(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startCreate() {
    setEditing(null);
    setForm({
      slug: "",
      label: "",
      shortLabel: "",
      iconKey: "plane",
      accentColor: "blue",
      description: "",
      addressInfo: "",
      sortOrder: "100",
    });
    setError("");
    setShowForm(true);
  }

  function startEdit(d: Destination) {
    setEditing(d);
    setForm({
      slug: d.slug,
      label: d.label,
      shortLabel: d.shortLabel,
      iconKey: d.iconKey,
      accentColor: d.accentColor,
      description: d.description || "",
      addressInfo: d.addressInfo || "",
      sortOrder: String(d.sortOrder),
    });
    setError("");
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      ...(editing ? { id: editing.id } : { slug: form.slug }),
      label: form.label,
      shortLabel: form.shortLabel,
      iconKey: form.iconKey,
      accentColor: form.accentColor,
      description: form.description || null,
      addressInfo: form.addressInfo || null,
      sortOrder: parseInt(form.sortOrder, 10) || 100,
    };
    const res = await fetch("/api/admin/destinations", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al guardar");
      return;
    }
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function toggleActive(d: Destination) {
    await fetch("/api/admin/destinations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: d.id, active: !d.active }),
    });
    load();
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Destinos</h1>
          <p className="text-sm text-brand-500">
            Configurá los destinos disponibles en el formulario de reserva.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="rounded-lg bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          + Nuevo destino
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="mb-6 rounded-xl border border-brand-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-brand-900">
            {editing ? `Editar ${editing.slug}` : "Crear destino"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">
                Slug (URL — solo minúsculas, números, guiones)
              </label>
              <input
                required
                disabled={!!editing}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                placeholder="ej: cordoba"
                className="w-full rounded border border-brand-200 px-3 py-2 text-sm disabled:bg-brand-50 disabled:text-brand-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">Orden (menor = primero)</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">Nombre completo</label>
              <input
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Aeroparque Jorge Newbery"
                className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">Nombre corto</label>
              <input
                required
                value={form.shortLabel}
                onChange={(e) => setForm({ ...form, shortLabel: e.target.value })}
                placeholder="Aeroparque"
                className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">Ícono</label>
              <select
                value={form.iconKey}
                onChange={(e) => setForm({ ...form, iconKey: e.target.value })}
                className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
              >
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">Color de acento</label>
              <select
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
              >
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">Descripción (pública)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">
              Instructivo de llegada (mostrado al cliente en el email)
            </label>
            <textarea
              value={form.addressInfo}
              onChange={(e) => setForm({ ...form, addressInfo: e.target.value })}
              rows={3}
              className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-brand-900 px-4 py-2 text-sm text-white">
              {editing ? "Guardar cambios" : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded px-4 py-2 text-sm text-brand-500 hover:text-brand-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50 text-left text-xs uppercase text-brand-500">
            <tr>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Ícono / Color</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-400">Cargando...</td></tr>
            ) : destinations.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-400">Sin destinos</td></tr>
            ) : destinations.map((d) => (
              <tr key={d.id} className={`hover:bg-brand-50 ${!d.active && "opacity-50"}`}>
                <td className="px-4 py-3 font-mono text-xs text-brand-600">{d.slug}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-brand-900">{d.label}</div>
                  <div className="text-xs text-brand-500">{d.shortLabel}</div>
                </td>
                <td className="px-4 py-3 text-xs text-brand-600">
                  {d.iconKey} · <span style={{ color: `var(--color, currentColor)` }}>{d.accentColor}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{d.sortOrder}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(d)}
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      d.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {d.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => startEdit(d)}
                    className="rounded bg-brand-100 px-2 py-1 text-xs text-brand-700 hover:bg-brand-200"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
