"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  value: string;                          // imageUrl actual
  onChange: (url: string) => void;
  folder?: string;                        // ej: "destinos", "hero"
  label?: string;
  aspectRatio?: "16/9" | "1/1" | "4/3";   // preview ratio
}

export function ImageUploadField({
  value,
  onChange,
  folder = "uploads",
  label = "Imagen",
  aspectRatio = "16/9",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al subir");
      }
      onChange(data.url);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((e as any)?.message || "Error al subir");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const aspectClass =
    aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "4/3" ? "aspect-[4/3]" : "aspect-video";

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-600">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {value ? (
        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg border border-brand-200 bg-brand-50`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-brand-700 shadow-sm hover:bg-white"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow-sm hover:bg-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`flex w-full ${aspectClass} flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 text-sm font-medium text-brand-500 transition hover:border-brand-400 hover:bg-brand-100 hover:text-brand-700 disabled:opacity-50`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" />
              Subir imagen
              <span className="text-xs font-normal text-brand-400">JPG / PNG / WebP, máx 5MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
