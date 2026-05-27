"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface Settings {
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  whatsappPhone: string | null;
  contactEmail: string | null;
  reviewUrl: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    heroImageUrl: "",
    heroImageAlt: "",
    heroTitle: "",
    heroSubtitle: "",
    whatsappPhone: "",
    contactEmail: "",
    reviewUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          heroImageUrl: data.heroImageUrl || "",
          heroImageAlt: data.heroImageAlt || "",
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          whatsappPhone: data.whatsappPhone || "",
          contactEmail: data.contactEmail || "",
          reviewUrl: data.reviewUrl || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Guardado correctamente ✓");
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage("Error al guardar");
    }
  }

  if (loading) return <div className="p-6 text-brand-400">Cargando...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Ajustes del sitio</h1>
        <p className="text-sm text-brand-500">
          Configurá la imagen del hero, datos de contacto y textos principales.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <section className="rounded-xl border border-brand-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-brand-900">Hero de la home</h2>

          <ImageUploadField
            label="Imagen principal (background del Hero)"
            value={settings.heroImageUrl || ""}
            onChange={(url) => setSettings({ ...settings, heroImageUrl: url })}
            folder="hero"
            aspectRatio="16/9"
          />

          {settings.heroImageUrl && (
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-600">Alt text</label>
              <input
                value={settings.heroImageAlt || ""}
                onChange={(e) => setSettings({ ...settings, heroImageAlt: e.target.value })}
                placeholder="Estacionamiento Costa Salguero"
                className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">
              Título (opcional — default si está vacío)
            </label>
            <input
              value={settings.heroTitle || ""}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              placeholder="Estacioná seguro. Viajá sin preocupaciones."
              className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">Subtítulo (opcional)</label>
            <textarea
              value={settings.heroSubtitle || ""}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              rows={2}
              placeholder="Estacionamiento propio en Costa Salguero con traslado incluido..."
              className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section className="rounded-xl border border-brand-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-brand-900">Contacto</h2>

          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">
              WhatsApp (formato internacional, sin +)
            </label>
            <input
              value={settings.whatsappPhone || ""}
              onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })}
              placeholder="5491131606994"
              className="w-full rounded border border-brand-200 px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">Email de contacto</label>
            <input
              type="email"
              value={settings.contactEmail || ""}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              placeholder="reservas@nrauditores.com.ar"
              className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-brand-600">
              URL para reseñas (Google Business, Trustpilot, etc.)
            </label>
            <input
              type="url"
              value={settings.reviewUrl || ""}
              onChange={(e) => setSettings({ ...settings, reviewUrl: e.target.value })}
              placeholder="https://g.page/r/..."
              className="w-full rounded border border-brand-200 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-brand-500">
              Se usa en el email de pedido de reseña post-viaje. Si está vacío, no se manda ese email.
            </p>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          {message && <span className="text-sm text-emerald-600">{message}</span>}
        </div>
      </div>
    </div>
  );
}
