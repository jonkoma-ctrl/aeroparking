"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Keyboard, CheckCircle2, XCircle, LogIn, LogOut, RotateCcw } from "lucide-react";

type ScanAction = "auto" | "in" | "out";

interface ScanResult {
  ok: boolean;
  action?: "in" | "out";
  message?: string;
  error?: string;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reservation?: any;
}

export function ScanClient() {
  const [mode, setMode] = useState<"idle" | "scanning" | "result">("idle");
  const [action, setAction] = useState<ScanAction>("auto");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const busyRef = useRef(false);

  const submitToken = useCallback(
    async (token: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setLoading(true);
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, action }),
        });
        const data: ScanResult = await res.json();
        setResult(data);
        setMode("result");
        // Vibración de feedback en mobile
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(data.ok ? 80 : [60, 40, 60]);
        }
      } catch {
        setResult({ ok: false, error: "Error de conexión. Reintentá." });
        setMode("result");
      } finally {
        setLoading(false);
        // Cortito para evitar doble-scan del mismo QR
        setTimeout(() => { busyRef.current = false; }, 1500);
      }
    },
    [action]
  );

  // Detiene la cámara al salir del modo scanning o desmontar
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* noop */ }
      scannerRef.current = null;
    }
  }, []);

  async function startCamera() {
    setMode("scanning");
    setResult(null);
    // Import dinámico: html5-qrcode solo en cliente
    const { Html5Qrcode } = await import("html5-qrcode");
    const el = document.getElementById("qr-reader");
    if (!el) return;
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = { stop: () => scanner.stop() };
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          submitToken(decodedText);
        },
        () => { /* ignore no-read frames */ }
      );
    } catch {
      setMode("idle");
      setResult({ ok: false, error: "No pudimos acceder a la cámara. Usá el código manual." });
    }
  }

  useEffect(() => {
    if (mode !== "scanning") stopCamera();
    return () => { stopCamera(); };
  }, [mode, stopCamera]);

  function reset() {
    setResult(null);
    setManualCode("");
    setMode("idle");
  }

  const actionPills: { key: ScanAction; label: string; icon: typeof LogIn }[] = [
    { key: "auto", label: "Automático", icon: RotateCcw },
    { key: "in", label: "Ingreso", icon: LogIn },
    { key: "out", label: "Retiro", icon: LogOut },
  ];

  return (
    <div className="mx-auto max-w-md p-4">
      {/* Selector de acción */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-500">Registrar</p>
        <div className="grid grid-cols-3 gap-2">
          {actionPills.map((p) => (
            <button
              key={p.key}
              onClick={() => setAction(p.key)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-xs font-semibold transition ${
                action === p.key
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-brand-200 bg-white text-brand-500"
              }`}
            >
              <p.icon className="h-5 w-5" />
              {p.label}
            </button>
          ))}
        </div>
        {action === "auto" && (
          <p className="mt-1.5 text-[11px] text-brand-400">
            Detecta solo: primer escaneo = ingreso, segundo = retiro.
          </p>
        )}
      </div>

      {mode === "idle" && (
        <div className="space-y-4">
          <button
            onClick={startCamera}
            className="flex w-full flex-col items-center gap-3 rounded-2xl bg-brand-900 py-10 text-white shadow-elevated transition hover:bg-brand-800 active:scale-[0.98]"
          >
            <Camera className="h-12 w-12" />
            <span className="text-lg font-bold">Escanear QR</span>
            <span className="text-xs text-brand-200">Tocá para abrir la cámara</span>
          </button>

          {/* Código manual */}
          <div className="rounded-2xl border border-brand-200 bg-white p-4">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500">
              <Keyboard className="h-4 w-4" /> ¿No lee el QR? Ingresá el código
            </label>
            <div className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Ej: A7K2QP"
                maxLength={12}
                className="flex-1 rounded-lg border border-brand-300 px-3 py-2.5 text-center font-mono text-lg tracking-widest uppercase"
              />
              <button
                onClick={() => manualCode.trim() && submitToken(manualCode.trim())}
                disabled={!manualCode.trim() || loading}
                className="rounded-lg bg-brand-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "scanning" && (
        <div className="space-y-3">
          <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-brand-300 bg-black" />
          <p className="text-center text-sm text-brand-500">
            Apuntá al QR del cliente…
          </p>
          <button
            onClick={reset}
            className="w-full rounded-xl border border-brand-200 bg-white py-3 text-sm font-semibold text-brand-600"
          >
            Cancelar
          </button>
        </div>
      )}

      {mode === "result" && result && (
        <ScanResultView result={result} onReset={reset} />
      )}
    </div>
  );
}

function ScanResultView({ result, onReset }: { result: ScanResult; onReset: () => void }) {
  const r = result.reservation;
  const ok = result.ok;

  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl p-6 text-center ${
          ok ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-300"
        }`}
      >
        {ok ? (
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        ) : (
          <XCircle className="mx-auto h-16 w-16 text-red-600" />
        )}
        <p className={`mt-3 text-xl font-extrabold ${ok ? "text-green-800" : "text-red-800"}`}>
          {ok
            ? result.action === "in"
              ? "INGRESO REGISTRADO"
              : "RETIRO REGISTRADO"
            : "NO SE PUDO REGISTRAR"}
        </p>
        <p className={`mt-1 text-sm ${ok ? "text-green-700" : "text-red-700"}`}>
          {ok ? result.message : result.error}
        </p>
      </div>

      {r && (
        <div className="rounded-2xl border border-brand-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-lg font-bold text-brand-900">{r.licensePlate}</span>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              {r.destination === "puerto" ? "Cruceros" : r.destination === "ezeiza" ? "Ezeiza" : "Aeroparque"}
            </span>
          </div>
          <dl className="space-y-1.5 text-sm">
            <Row label="Cliente" value={r.customerName} />
            <Row label="Vehículo" value={`${r.carBrand} ${r.carModel}`} />
            <Row label="Servicio" value={r.serviceType} />
            {r.passengers ? <Row label="Pasajeros" value={String(r.passengers)} /> : null}
            <Row label="Código" value={r.code} />
          </dl>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full rounded-xl bg-brand-900 py-4 text-base font-bold text-white transition hover:bg-brand-800 active:scale-[0.98]"
      >
        Escanear otro
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-brand-500">{label}</dt>
      <dd className="font-medium text-brand-900">{value}</dd>
    </div>
  );
}
