"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Car, CalendarPlus, XCircle, QrCode, CreditCard } from "lucide-react";
import { formatDate, getStatusLabel, getStatusColor, formatPrice } from "@/lib/utils";
import { CONTACT, CANCEL_REFUND_HOURS, CRUISE_TERMINAL } from "@/lib/constants";

interface ReservationData {
  id: string;
  externalOrderId: string;
  destination: string;
  serviceType: string;
  customerName: string;
  email: string | null;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  startDate: string;
  endDate: string;
  checkInTime: string | null;
  arrivalTime: string | null;
  departureAirline: string | null;
  departureFlight: string | null;
  arrivalAirline: string | null;
  arrivalFlight: string | null;
  cruiseLine: string | null;
  passengers: number | null;
  price: number;
  status: string;
  paid: boolean;
  unpaid: boolean;
  checkedIn: boolean;
  qrToken: string | null;
}

type Auth = { order: string; t?: string; email?: string };
type Panel = null | "patente" | "extender" | "cancelar";

function maskEmail(e: string | null) {
  if (!e) return "";
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}${"•".repeat(Math.max(1, u.length - 2))}@${d}`;
}

function destinoLabel(d: string) {
  return d === "puerto" ? CRUISE_TERMINAL.name : d === "ezeiza" ? "Ezeiza" : "Aeroparque";
}

function MiReservaContent() {
  const sp = useSearchParams();
  const [order, setOrder] = useState((sp.get("order") || "").toUpperCase());
  const [email, setEmail] = useState("");
  const [auth, setAuth] = useState<Auth | null>(null);
  const [data, setData] = useState<ReservationData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [panel, setPanel] = useState<Panel>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [plate, setPlate] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [quote, setQuote] = useState<{ extensionCost: number; extraDays: number } | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async (a: Auth) => {
    setLoading(true);
    setError("");
    const qs = new URLSearchParams({ order: a.order, ...(a.t ? { t: a.t } : {}), ...(a.email ? { email: a.email } : {}) });
    try {
      const res = await fetch(`/api/mi-reserva?${qs}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No encontramos la reserva.");
        setData(null);
      } else {
        setData(json);
        setAuth(a);
      }
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    }
    setLoading(false);
  }, []);

  // Desde el link del mail (firmado) entramos directo.
  useEffect(() => {
    const t = sp.get("t");
    const o = sp.get("order");
    if (o && t) load({ order: o.toUpperCase(), t });
  }, [sp, load]);

  async function act(path: string, extra: Record<string, unknown>) {
    if (!auth) return null;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, ...extra }),
      });
      const json = await res.json();
      setBusy(false);
      if (!res.ok) {
        setMsg({ ok: false, text: json.error || "No se pudo completar." });
        return null;
      }
      return json;
    } catch {
      setBusy(false);
      setMsg({ ok: false, text: "Error de conexión. Probá de nuevo." });
      return null;
    }
  }

  async function resend() {
    const r = await act("/api/mi-reserva/reenviar", {});
    if (r) setMsg({ ok: true, text: `Listo, te lo reenviamos a ${maskEmail(r.email)}. Si no lo ves, revisá spam.` });
  }
  async function changePlate() {
    const r = await act("/api/mi-reserva/patente", { licensePlate: plate });
    if (r && data) {
      setData({ ...data, licensePlate: r.licensePlate });
      setPanel(null);
      setMsg({ ok: true, text: `Patente actualizada: ${r.licensePlate}.` });
    }
  }
  async function fetchQuote(date: string) {
    setQuote(null);
    if (!auth || !date) return;
    const qs = new URLSearchParams({ order: auth.order, newEndDate: date, ...(auth.t ? { t: auth.t } : {}), ...(auth.email ? { email: auth.email } : {}) });
    const res = await fetch(`/api/mi-reserva/quote?${qs}`);
    const json = await res.json();
    if (res.ok) setQuote(json);
    else setMsg({ ok: false, text: json.error });
  }
  async function extend() {
    const r = await act("/api/mi-reserva/extend", { newEndDate: newEnd, reason });
    if (r && data) {
      setData({ ...data, status: "extension_requested" });
      setPanel(null);
      setMsg({ ok: true, text: "Recibimos tu pedido de extensión. Te escribimos para coordinar el pago de la diferencia." });
    }
  }
  async function cancel() {
    const r = await act("/api/mi-reserva/cancel", { reason });
    if (r && data) {
      setData({ ...data, status: "cancellation_requested" });
      setPanel(null);
      setMsg({ ok: true, text: "Recibimos tu pedido de cancelación. Te escribimos a la brevedad." });
    }
  }

  const canRefund = !!data && new Date(data.startDate).getTime() - Date.now() > CANCEL_REFUND_HOURS * 60 * 60 * 1000;
  const editable = data && !data.checkedIn && ["confirmed", "pending_payment", "payment_rejected", "payment_expired", "extension_requested"].includes(data.status);

  return (
    <main className="min-h-[80vh] bg-brand-50 py-10 sm:py-16">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="font-display text-3xl font-extrabold text-brand-900">Mi reserva</h1>
        <p className="mt-1 text-sm text-brand-600">Mirá tu QR, reenviate el mail o hacé cambios.</p>

        {!data && (
          <form
            className="mt-6 space-y-3 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft"
            onSubmit={(e) => {
              e.preventDefault();
              if (order && email) load({ order: order.trim().toUpperCase(), email: email.trim() });
            }}
          >
            <label className="block text-sm font-medium text-brand-700">
              Código de reserva
              <input
                value={order}
                onChange={(e) => setOrder(e.target.value.toUpperCase())}
                placeholder="KP-2026-123456"
                className="mt-1 w-full rounded-xl border border-brand-200 px-4 py-3 font-mono text-brand-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </label>
            <label className="block text-sm font-medium text-brand-700">
              Mail con el que reservaste
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@mail.com"
                className="mt-1 w-full rounded-xl border border-brand-200 px-4 py-3 text-brand-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Buscar mi reserva
            </button>
            <p className="text-xs text-brand-500">Tip: el botón «Gestionar mi reserva» del mail te trae directo, sin completar nada.</p>
          </form>
        )}

        {loading && data === null && auth === null && sp.get("t") && (
          <div className="mt-6 flex items-center gap-2 text-brand-600"><Loader2 className="h-4 w-4 animate-spin" /> Buscando tu reserva…</div>
        )}

        {error && <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {data && (
          <div className="mt-6 space-y-4">
            {/* Estado + QR */}
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Código</p>
                  <p className="font-mono text-2xl font-extrabold text-brand-900">{data.externalOrderId}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(data.status)}`}>
                  {getStatusLabel(data.status)}
                </span>
              </div>

              {data.qrToken && (
                <div className="mt-5 flex flex-col items-center rounded-2xl bg-brand-50 p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/qr/${data.qrToken}`} alt="Tu código QR de ingreso" width={200} height={200} className="h-48 w-48 rounded-xl bg-white p-2" />
                  <p className="mt-2 text-sm text-brand-600">Mostralo al llegar a BA Ferial · código <span className="font-mono font-bold text-brand-900">{data.qrToken}</span></p>
                </div>
              )}

              {data.unpaid && (
                <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Tu reserva todavía no está paga.</p>
                  <p className="mt-1">Cuando se apruebe el pago te llega el mail con el QR.</p>
                  <Link href={`/reservar/resultado?r=${data.id}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
                    <CreditCard className="h-4 w-4" /> Completar el pago
                  </Link>
                </div>
              )}
            </div>

            {/* Datos */}
            <dl className="space-y-2.5 rounded-2xl border border-brand-100 bg-white p-6 text-sm shadow-soft">
              <Row k="Titular" v={data.customerName} />
              <Row k="Destino" v={destinoLabel(data.destination)} />
              <Row k="Vehículo" v={`${data.licensePlate} · ${data.carBrand} ${data.carModel}`} />
              <Row k="Ingreso a BA Ferial" v={`${formatDate(data.startDate)}${data.checkInTime ? ` · ${data.checkInTime} hs` : ""}`} />
              <Row k="Retiro" v={`${formatDate(data.endDate)}${data.arrivalTime ? ` · ${data.arrivalTime} hs` : ""}`} />
              {(data.departureFlight || data.departureAirline) && <Row k="Vuelo de ida" v={[data.departureAirline, data.departureFlight].filter(Boolean).join(" ")} />}
              {(data.arrivalFlight || data.arrivalAirline) && <Row k="Vuelo de vuelta" v={[data.arrivalAirline, data.arrivalFlight].filter(Boolean).join(" ")} />}
              {data.cruiseLine && <Row k="Crucero" v={data.cruiseLine} />}
              {data.passengers ? <Row k="Pasajeros" v={String(data.passengers)} /> : null}
              {data.price > 0 && <Row k={data.paid ? "Pagado" : "Total"} v={formatPrice(data.price)} />}
            </dl>

            {data.paid && data.status === "confirmed" && !data.checkedIn && !canRefund && (
              <p className="rounded-xl bg-brand-50 p-3 text-xs text-brand-600">
                Faltan menos de {CANCEL_REFUND_HOURS} h para el ingreso: la reserva ya no se puede cancelar con devolución.
              </p>
            )}

            {msg && (
              <div className={`rounded-xl p-4 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</div>
            )}

            {/* Acciones */}
            <div className="grid gap-3 sm:grid-cols-2">
              {data.paid && data.status !== "cancellation_requested" && (
                <ActionBtn icon={Mail} label="Reenviarme el mail con el QR" onClick={resend} disabled={busy} />
              )}
              {editable && <ActionBtn icon={Car} label="Cambiar la patente" onClick={() => { setPanel(panel === "patente" ? null : "patente"); setPlate(data.licensePlate); setMsg(null); }} />}
              {data.paid && ["confirmed", "checked_in"].includes(data.status) && (
                <ActionBtn icon={CalendarPlus} label="Extender la estadía" onClick={() => { setPanel(panel === "extender" ? null : "extender"); setMsg(null); }} />
              )}
              {data.paid && data.status === "confirmed" && !data.checkedIn && canRefund && (
                <ActionBtn icon={XCircle} label="Cancelar con devolución" onClick={() => { setPanel(panel === "cancelar" ? null : "cancelar"); setMsg(null); }} tone="danger" />
              )}
            </div>

            {panel === "patente" && (
              <Box>
                <label className="block text-sm font-medium text-brand-700">
                  Nueva patente
                  <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="AB123CD" className="mt-1 w-full rounded-xl border border-brand-200 px-4 py-3 font-mono uppercase text-brand-900" />
                </label>
                <SubmitBtn busy={busy} onClick={changePlate} label="Guardar patente" />
              </Box>
            )}

            {panel === "extender" && (
              <Box>
                <label className="block text-sm font-medium text-brand-700">
                  Nueva fecha de retiro
                  <input type="date" value={newEnd} onChange={(e) => { setNewEnd(e.target.value); fetchQuote(e.target.value); }} className="mt-1 w-full rounded-xl border border-brand-200 px-4 py-3 text-brand-900" />
                </label>
                {quote && (
                  <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
                    {quote.extraDays} {quote.extraDays === 1 ? "día" : "días"} más · diferencia a pagar: <strong>{formatPrice(quote.extensionCost)}</strong>
                  </p>
                )}
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (opcional)" className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm" />
                <SubmitBtn busy={busy} onClick={extend} label="Pedir extensión" disabled={!newEnd} />
                <p className="text-xs text-brand-500">Te escribimos para confirmar y cobrar la diferencia.</p>
              </Box>
            )}

            {panel === "cancelar" && (
              <Box>
                <p className="text-sm text-brand-700">
                  Como faltan más de {CANCEL_REFUND_HOURS} h para el ingreso, te devolvemos el 100 % de lo que pagaste en tu medio de pago de Mercado Pago. Te escribimos para confirmarlo.
                </p>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo (opcional)" className="w-full rounded-xl border border-brand-200 px-4 py-3 text-sm" />
                <SubmitBtn busy={busy} onClick={cancel} label="Confirmar pedido de cancelación" tone="danger" />
              </Box>
            )}

            <p className="pt-2 text-center text-xs text-brand-500">
              ¿Algo más? Escribinos por{" "}
              <a href={`https://wa.me/${CONTACT.whatsapp}`} className="font-semibold text-brand-700 hover:underline">WhatsApp {CONTACT.phone}</a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brand-500">{k}</dt>
      <dd className="text-right font-medium text-brand-900">{v}</dd>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, disabled, tone }: { icon: typeof QrCode; label: string; onClick: () => void; disabled?: boolean; tone?: "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
        tone === "danger" ? "border-red-200 bg-white text-red-700 hover:bg-red-50" : "border-brand-200 bg-white text-brand-800 hover:bg-brand-50"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">{children}</div>;
}

function SubmitBtn({ busy, onClick, label, disabled, tone }: { busy: boolean; onClick: () => void; label: string; disabled?: boolean; tone?: "danger" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />} {label}
    </button>
  );
}

export default function MiReservaPage() {
  return (
    <Suspense>
      <MiReservaContent />
    </Suspense>
  );
}
