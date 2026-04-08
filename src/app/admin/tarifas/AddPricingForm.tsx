"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddPricingForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("puerto");
  const [serviceType, setServiceType] = useState("larga_estadia");
  const [pricePerDay, setPricePerDay] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pricePerDay) return;
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        serviceType,
        pricePerDay: parseInt(pricePerDay, 10),
        description: description || null,
      }),
    });

    if (res.ok) {
      setMsg("Tarifa guardada");
      setPricePerDay("");
      setDescription("");
      router.refresh();
    } else {
      const data = await res.json();
      setMsg(data.error || "Error");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-brand-500 mb-1">Destino</label>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="rounded-md border border-brand-200 px-3 py-2 text-sm"
        >
          <option value="puerto">Puerto de BA</option>
          <option value="aeroparque">Aeroparque</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-brand-500 mb-1">Servicio</label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="rounded-md border border-brand-200 px-3 py-2 text-sm"
        >
          <option value="larga_estadia">Larga Estadía</option>
          <option value="drop_go">Drop & Go</option>
          <option value="cruceros">Cruceros</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-brand-500 mb-1">Precio/día ($)</label>
        <input
          type="number"
          value={pricePerDay}
          onChange={(e) => setPricePerDay(e.target.value)}
          placeholder="27000"
          className="w-32 rounded-md border border-brand-200 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-brand-500 mb-1">Descripción</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Larga Estadía Costa Salguero"
          className="w-64 rounded-md border border-brand-200 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !pricePerDay}
        className="rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50"
      >
        {loading ? "..." : "Guardar"}
      </button>
      {msg && <span className="text-sm text-green-600">{msg}</span>}
    </form>
  );
}
