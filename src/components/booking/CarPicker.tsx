"use client";

import { CAR_BRAND_NAMES, modelsForBrand } from "@/lib/car-data";

const OTRO = "__otro__";

interface Props {
  brand: string;
  model: string;
  onBrandChange: (v: string) => void;
  onModelChange: (v: string) => void;
  brandError?: string;
  modelError?: string;
  /** clase base de inputs, para matchear el resto del form */
  inputClass: (err: boolean) => string;
}

/**
 * Selector encadenado marca → modelo. Elegís la marca de una lista y se
 * filtran los modelos. "Otro" en cualquiera de los dos abre un campo de
 * texto libre (para marcas/modelos que no estén en la lista).
 */
export function CarPicker({
  brand,
  model,
  onBrandChange,
  onModelChange,
  brandError,
  modelError,
  inputClass,
}: Props) {
  const knownBrand = CAR_BRAND_NAMES.includes(brand);
  // Si la marca cargada no está en la lista (ej: reserva vieja o texto libre),
  // tratamos el estado como "Otro".
  const brandSelectValue = brand === "" ? "" : knownBrand ? brand : OTRO;
  const models = knownBrand ? modelsForBrand(brand) : [];
  const knownModel = models.includes(model);
  const modelSelectValue = model === "" ? "" : knownModel ? model : OTRO;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Marca */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-700">Marca</label>
        <select
          value={brandSelectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === OTRO) {
              onBrandChange(""); // limpia para que el usuario escriba
              onModelChange("");
            } else {
              onBrandChange(v);
              onModelChange(""); // reset modelo al cambiar marca
            }
          }}
          className={inputClass(!!brandError)}
        >
          <option value="">Elegí la marca…</option>
          {CAR_BRAND_NAMES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
          <option value={OTRO}>Otra marca…</option>
        </select>
        {/* Campo libre cuando eligió "Otro" o la marca no está en la lista */}
        {brandSelectValue === OTRO && (
          <input
            type="text"
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            placeholder="Escribí la marca"
            className={`mt-2 ${inputClass(!!brandError)}`}
            autoFocus
          />
        )}
        {brandError && <p className="mt-1 text-xs text-red-600">{brandError}</p>}
      </div>

      {/* Modelo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-brand-700">Modelo</label>
        {knownBrand && models.length > 0 ? (
          <>
            <select
              value={modelSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                onModelChange(v === OTRO ? "" : v);
              }}
              className={inputClass(!!modelError)}
            >
              <option value="">Elegí el modelo…</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value={OTRO}>Otro modelo…</option>
            </select>
            {modelSelectValue === OTRO && (
              <input
                type="text"
                value={model}
                onChange={(e) => onModelChange(e.target.value)}
                placeholder="Escribí el modelo"
                className={`mt-2 ${inputClass(!!modelError)}`}
                autoFocus
              />
            )}
          </>
        ) : (
          // Sin marca elegida o marca "Otra" → modelo libre
          <input
            type="text"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            placeholder="Modelo del vehículo"
            className={inputClass(!!modelError)}
            disabled={brandSelectValue === ""}
          />
        )}
        {modelError && <p className="mt-1 text-xs text-red-600">{modelError}</p>}
      </div>
    </div>
  );
}
