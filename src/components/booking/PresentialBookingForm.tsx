"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Car,
  Plane,
  Ship,
  User,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Copy,
  AlertCircle,
} from "lucide-react";
import {
  presentialReservationSchema,
  type PresentialReservationInput,
} from "@/lib/validations";
import { CONTACT } from "@/lib/constants";
import type { Destino } from "@/lib/pricing";

type DbServiceType = "drop_go" | "larga_estadia" | "cruceros";

interface Props {
  destino: Destino;
  /// Service type por defecto. Para Aeroparque y Ezeiza usamos "larga_estadia"
  /// (el cliente deja el auto en Costa Salguero, lo trasladamos al aeropuerto).
  /// Para Puerto, "cruceros".
  defaultServiceType?: DbServiceType;
}

interface FormState {
  // Step 1 — Fechas
  startDate: string;
  checkInTime: string;
  endDate: string;
  arrivalTime: string;
  passengers: string;

  // Step 2 — Vehículo
  licensePlate: string;
  carBrand: string;
  carModel: string;

  // Step 3 — Vuelo / crucero
  departureAirline: string;
  departureFlight: string;
  arrivalAirline: string;
  arrivalFlight: string;
  cruiseLine: string;
  terminal: string;

  // Step 4 — Contacto
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

const initialState: FormState = {
  startDate: "",
  checkInTime: "",
  endDate: "",
  arrivalTime: "",
  passengers: "1",
  licensePlate: "",
  carBrand: "",
  carModel: "",
  departureAirline: "",
  departureFlight: "",
  arrivalAirline: "",
  arrivalFlight: "",
  cruiseLine: "",
  terminal: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
};

const destinoMeta: Record<Destino, { label: string; icon: typeof Plane; accentColor: string; tripLabel: string }> = {
  aeroparque: {
    label: "Aeroparque Jorge Newbery",
    icon: Plane,
    accentColor: "text-blue-600",
    tripLabel: "vuelo",
  },
  ezeiza: {
    label: "Aeropuerto de Ezeiza",
    icon: Plane,
    accentColor: "text-sky-600",
    tripLabel: "vuelo",
  },
  puerto: {
    label: "Terminal de Cruceros",
    icon: Ship,
    accentColor: "text-violet-600",
    tripLabel: "crucero",
  },
};

const STEPS = [
  { id: 1, label: "Fechas", icon: Calendar },
  { id: 2, label: "Vehículo", icon: Car },
  { id: 3, label: "Viaje", icon: Plane },
  { id: 4, label: "Contacto", icon: User },
];

export function PresentialBookingForm({ destino, defaultServiceType }: Props) {
  const meta = destinoMeta[destino];
  const isCruceros = destino === "puerto";
  const serviceType: DbServiceType =
    defaultServiceType ?? (isCruceros ? "cruceros" : "larga_estadia");

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ code: string } | null>(null);

  // Defaults cómodos: hoy mañana 24hs+ → mínimo permitido es mañana
  const minDate = useMemo(() => {
    const t = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return t.toISOString().split("T")[0];
  }, []);

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      if (!e[field]) return e;
      const next = { ...e };
      delete next[field];
      return next;
    });
  }

  function validateStep(currentStep: number): boolean {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.startDate) stepErrors.startDate = "Seleccioná la fecha de ingreso";
      if (!form.checkInTime) stepErrors.checkInTime = "Indicá la hora de ingreso";
      if (!form.endDate) stepErrors.endDate = "Seleccioná la fecha de retiro";
      if (!form.arrivalTime) stepErrors.arrivalTime = "Indicá la hora de retiro";

      if (form.startDate && form.endDate) {
        const start = new Date(`${form.startDate}T${form.checkInTime || "00:00"}`);
        const end = new Date(`${form.endDate}T${form.arrivalTime || "00:00"}`);
        if (end <= start) {
          stepErrors.endDate = "La fecha de retiro debe ser posterior al ingreso";
        }
        const minStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
        if (start < minStart) {
          stepErrors.startDate =
            "Las reservas online se aceptan con al menos 24hs de anticipación";
        }
      }
      const pax = Number(form.passengers);
      if (!pax || pax < 1) stepErrors.passengers = "Mínimo 1 pasajero";
      if (pax > 20) stepErrors.passengers = "Máximo 20 pasajeros";
    }

    if (currentStep === 2) {
      const plate = form.licensePlate.replace(/\s+/g, "").toUpperCase();
      if (!plate) stepErrors.licensePlate = "Ingresá la patente";
      else if (!/^[A-Z0-9]{6,8}$/i.test(plate))
        stepErrors.licensePlate = "Formato de patente inválido";
      if (!form.carBrand || form.carBrand.length < 2)
        stepErrors.carBrand = "Ingresá la marca";
      if (!form.carModel) stepErrors.carModel = "Ingresá el modelo";
    }

    // Step 3 — vuelo es opcional para no bloquear (lo recordamos al admin)

    if (currentStep === 4) {
      if (!form.firstName || form.firstName.length < 2)
        stepErrors.firstName = "Ingresá tu nombre";
      if (!form.lastName || form.lastName.length < 2)
        stepErrors.lastName = "Ingresá tu apellido";
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        stepErrors.email = "Email inválido";
      if (!form.phone || form.phone.length < 8)
        stepErrors.phone = "Ingresá tu teléfono / WhatsApp";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length + 1));
      // scroll to top
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);

    const payload: PresentialReservationInput = {
      destination: destino,
      serviceType,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      licensePlate: form.licensePlate.replace(/\s+/g, "").toUpperCase(),
      carBrand: form.carBrand.trim(),
      carModel: form.carModel.trim(),
      passengers: Number(form.passengers) || 1,
      startDate: form.startDate,
      checkInTime: form.checkInTime,
      endDate: form.endDate,
      arrivalTime: form.arrivalTime,
      departureAirline: form.departureAirline.trim() || "",
      departureFlight: form.departureFlight.trim() || "",
      arrivalAirline: form.arrivalAirline.trim() || "",
      arrivalFlight: form.arrivalFlight.trim() || "",
      cruiseLine: form.cruiseLine.trim() || "",
      terminal: form.terminal.trim() || "",
      notes: form.notes.trim() || "",
    };

    // Validate one more time before sending
    const result = presentialReservationSchema.safeParse(payload);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const firstError = Object.values(flat).flat()[0] as string | undefined;
      setSubmitError(firstError || "Revisá los datos del formulario.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/reservas/presencial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "No pudimos crear la reserva. Intentá de nuevo.");
        setSubmitting(false);
        return;
      }

      setSuccess({ code: data.code });
      setSubmitting(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Error de conexión. Probá de nuevo en un momento.");
      setSubmitting(false);
    }
  }

  // ─── Success view ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <main className="min-h-[80vh] bg-brand-50 py-12 sm:py-20">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-lg sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h1 className="text-center text-3xl font-extrabold text-brand-900 sm:text-4xl">
              ¡Reserva confirmada!
            </h1>
            <p className="mt-3 text-center text-base text-brand-600">
              Te enviamos un mail con todos los detalles a{" "}
              <strong className="text-brand-900">{form.email}</strong>.
            </p>

            <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                Tu código de reserva
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-widest text-brand-900 sm:text-4xl">
                {success.code}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(success.code);
                  }
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-500 transition-colors hover:text-brand-900"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar código
              </button>
            </div>

            <div className="mt-8 rounded-xl bg-blue-50 p-5 text-sm leading-relaxed text-blue-900">
              <p className="font-semibold">¿Qué sigue?</p>
              <ul className="mt-2 list-disc pl-5 text-blue-800">
                <li>Llegá a Costa Salguero en la fecha y hora reservada</li>
                <li>Mostrá este código al personal</li>
                <li>El pago se hace al dejar el vehículo (efectivo, tarjeta o transferencia)</li>
              </ul>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/mi-reserva?order=${success.code}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Ver mi reserva
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                Volver al inicio
              </Link>
            </div>

            <div className="mt-6 border-t border-brand-100 pt-6 text-center text-xs text-brand-500">
              ¿Necesitás ayuda? <br className="sm:hidden" />
              <a href={`tel:+${CONTACT.whatsapp}`} className="font-semibold text-brand-700 hover:underline">
                {CONTACT.phone}
              </a>{" "}
              · {CONTACT.email}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Form view ─────────────────────────────────────────────────────────────
  const showSummary = step === STEPS.length + 1;
  const Icon = meta.icon;

  return (
    <main className="min-h-[80vh] bg-brand-50 py-8 sm:py-12">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 transition-colors hover:text-brand-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            <div className={`mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${meta.accentColor}`}>
              <Icon className="h-4 w-4" />
              {meta.label}
            </div>
            <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
              Reservá tu estacionamiento + traslado
            </h1>
            <p className="mt-1 text-sm text-brand-600">
              Pago presencial al dejar el vehículo · Atención 24 horas
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6 rounded-2xl border border-brand-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {STEPS.map((s, idx) => {
                const StepIcon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id || showSummary;
                return (
                  <div key={s.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isDone
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-brand-900 text-white scale-110"
                            : "bg-brand-100 text-brand-400"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-4 w-4" />}
                      </div>
                      <span className={`mt-1 hidden text-[10px] font-semibold uppercase tracking-wide sm:block ${isActive ? "text-brand-900" : "text-brand-400"}`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`mx-1 h-0.5 flex-1 transition-colors ${step > s.id || showSummary ? "bg-green-500" : "bg-brand-100"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-brand-200 bg-white p-6 shadow-sm sm:p-8">
            {/* Step 1: Fechas */}
            {step === 1 && (
              <div className="space-y-5">
                <SectionHeader
                  icon={Calendar}
                  title="¿Cuándo viajás?"
                  description="Necesitamos saber tu fecha y hora de ingreso al estacionamiento, y cuándo lo retirás."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Fecha de ingreso" error={errors.startDate}>
                    <input
                      type="date"
                      min={minDate}
                      value={form.startDate}
                      onChange={(e) => update("startDate", e.target.value)}
                      className={inputClass(!!errors.startDate)}
                    />
                  </Field>
                  <Field label="Hora de ingreso" error={errors.checkInTime}>
                    <input
                      type="time"
                      value={form.checkInTime}
                      onChange={(e) => update("checkInTime", e.target.value)}
                      className={inputClass(!!errors.checkInTime)}
                    />
                  </Field>
                  <Field label="Fecha de retiro" error={errors.endDate}>
                    <input
                      type="date"
                      min={form.startDate || minDate}
                      value={form.endDate}
                      onChange={(e) => update("endDate", e.target.value)}
                      className={inputClass(!!errors.endDate)}
                    />
                  </Field>
                  <Field label="Hora de retiro" error={errors.arrivalTime}>
                    <input
                      type="time"
                      value={form.arrivalTime}
                      onChange={(e) => update("arrivalTime", e.target.value)}
                      className={inputClass(!!errors.arrivalTime)}
                    />
                  </Field>
                </div>
                <Field label="Pasajeros" error={errors.passengers} helpText="Cuántas personas viajan en el vehículo">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.passengers}
                    onChange={(e) => update("passengers", e.target.value)}
                    className={inputClass(!!errors.passengers)}
                  />
                </Field>
              </div>
            )}

            {/* Step 2: Vehículo */}
            {step === 2 && (
              <div className="space-y-5">
                <SectionHeader
                  icon={Car}
                  title="Tu vehículo"
                  description="Para identificarlo cuando llegues a Costa Salguero."
                />
                <Field label="Patente" error={errors.licensePlate} helpText="Sin guiones ni espacios — ej. AB123CD">
                  <input
                    type="text"
                    value={form.licensePlate}
                    onChange={(e) => update("licensePlate", e.target.value.toUpperCase())}
                    className={`${inputClass(!!errors.licensePlate)} font-mono uppercase tracking-wider`}
                    maxLength={10}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Marca" error={errors.carBrand}>
                    <input
                      type="text"
                      value={form.carBrand}
                      onChange={(e) => update("carBrand", e.target.value)}
                      placeholder="Toyota"
                      className={inputClass(!!errors.carBrand)}
                    />
                  </Field>
                  <Field label="Modelo" error={errors.carModel}>
                    <input
                      type="text"
                      value={form.carModel}
                      onChange={(e) => update("carModel", e.target.value)}
                      placeholder="Corolla"
                      className={inputClass(!!errors.carModel)}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 3: Vuelo / crucero */}
            {step === 3 && (
              <div className="space-y-5">
                <SectionHeader
                  icon={Icon}
                  title={isCruceros ? "Datos del crucero" : "Datos del vuelo"}
                  description={
                    isCruceros
                      ? "Opcional — nos ayuda a coordinar el traslado a la terminal."
                      : "Opcional, pero recomendado — coordinamos el traslado según tu vuelo."
                  }
                />

                {isCruceros ? (
                  <>
                    <Field label="Naviera">
                      <input
                        type="text"
                        value={form.cruiseLine}
                        onChange={(e) => update("cruiseLine", e.target.value)}
                        placeholder="MSC, Costa, Royal Caribbean..."
                        className={inputClass(false)}
                      />
                    </Field>
                    <Field label="Terminal">
                      <input
                        type="text"
                        value={form.terminal}
                        onChange={(e) => update("terminal", e.target.value)}
                        placeholder="Quinquela Martín / Puerto Nuevo"
                        className={inputClass(false)}
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Vuelo de salida
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Aerolínea">
                        <input
                          type="text"
                          value={form.departureAirline}
                          onChange={(e) => update("departureAirline", e.target.value)}
                          placeholder="Aerolíneas Argentinas"
                          className={inputClass(false)}
                        />
                      </Field>
                      <Field label="Número de vuelo">
                        <input
                          type="text"
                          value={form.departureFlight}
                          onChange={(e) => update("departureFlight", e.target.value)}
                          placeholder="AR1234"
                          className={inputClass(false)}
                        />
                      </Field>
                    </div>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand-500">
                      Vuelo de regreso
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Aerolínea">
                        <input
                          type="text"
                          value={form.arrivalAirline}
                          onChange={(e) => update("arrivalAirline", e.target.value)}
                          placeholder="Aerolíneas Argentinas"
                          className={inputClass(false)}
                        />
                      </Field>
                      <Field label="Número de vuelo">
                        <input
                          type="text"
                          value={form.arrivalFlight}
                          onChange={(e) => update("arrivalFlight", e.target.value)}
                          placeholder="AR1235"
                          className={inputClass(false)}
                        />
                      </Field>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Contacto */}
            {step === 4 && (
              <div className="space-y-5">
                <SectionHeader
                  icon={User}
                  title="¿Quién hace la reserva?"
                  description="Necesitamos cómo contactarte para confirmaciones y avisos."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nombre" error={errors.firstName}>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      className={inputClass(!!errors.firstName)}
                    />
                  </Field>
                  <Field label="Apellido" error={errors.lastName}>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      className={inputClass(!!errors.lastName)}
                    />
                  </Field>
                </div>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClass(!!errors.email)}
                  />
                </Field>
                <Field
                  label="Teléfono / WhatsApp"
                  error={errors.phone}
                  helpText="Te contactamos por aquí ante cualquier cambio"
                >
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="11 1234 5678"
                    className={inputClass(!!errors.phone)}
                  />
                </Field>
                <Field label="Observaciones" helpText="Opcional — algo que tengamos que saber">
                  <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    rows={3}
                    className={inputClass(false)}
                    placeholder="Ej: el cierre del baúl está averiado"
                  />
                </Field>
              </div>
            )}

            {/* Step 5 / Summary */}
            {showSummary && (
              <div className="space-y-5">
                <SectionHeader
                  icon={CheckCircle2}
                  title="Revisá tu reserva"
                  description="Confirmá que todos los datos estén correctos antes de enviar."
                />

                <SummarySection title="Destino y fechas">
                  <Row label="Destino" value={meta.label} />
                  <Row
                    label="Ingreso"
                    value={`${form.startDate} ${form.checkInTime}`}
                  />
                  <Row
                    label="Retiro"
                    value={`${form.endDate} ${form.arrivalTime}`}
                  />
                  <Row label="Pasajeros" value={form.passengers} />
                </SummarySection>

                <SummarySection title="Vehículo">
                  <Row label="Patente" value={form.licensePlate} />
                  <Row label="Marca / modelo" value={`${form.carBrand} ${form.carModel}`} />
                </SummarySection>

                {(form.departureAirline ||
                  form.departureFlight ||
                  form.arrivalAirline ||
                  form.arrivalFlight ||
                  form.cruiseLine ||
                  form.terminal) && (
                  <SummarySection title={isCruceros ? "Crucero" : "Vuelo"}>
                    {form.departureAirline && <Row label="Aerolínea salida" value={form.departureAirline} />}
                    {form.departureFlight && <Row label="Vuelo salida" value={form.departureFlight} />}
                    {form.arrivalAirline && <Row label="Aerolínea regreso" value={form.arrivalAirline} />}
                    {form.arrivalFlight && <Row label="Vuelo regreso" value={form.arrivalFlight} />}
                    {form.cruiseLine && <Row label="Naviera" value={form.cruiseLine} />}
                    {form.terminal && <Row label="Terminal" value={form.terminal} />}
                  </SummarySection>
                )}

                <SummarySection title="Contacto">
                  <Row label="Nombre" value={`${form.firstName} ${form.lastName}`} />
                  <Row label="Email" value={form.email} />
                  <Row label="Teléfono" value={form.phone} />
                  {form.notes && <Row label="Observaciones" value={form.notes} />}
                </SummarySection>

                <div className="rounded-xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-700">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-900" />
                    <span>
                      <strong className="text-brand-900">Pago presencial</strong> al
                      dejar el vehículo. Aceptamos efectivo, tarjeta y transferencia.
                    </span>
                  </p>
                  <p className="mt-2 flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-900" />
                    <span>El traslado ida y vuelta está incluido en el precio.</span>
                  </p>
                </div>

                {submitError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
              {step > 1 && !submitting && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Atrás
                </button>
              )}

              <div className="flex-1" />

              {!showSummary ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Confirmar reserva
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Help block */}
          <div className="mt-6 rounded-xl border border-brand-200 bg-white p-5 text-center text-sm text-brand-600">
            ¿Necesitás ayuda?{" "}
            <a href={`tel:+${CONTACT.whatsapp}`} className="inline-flex items-center gap-1 font-semibold text-brand-900 hover:underline">
              <Phone className="h-3.5 w-3.5" /> {CONTACT.phone}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-1 font-semibold text-brand-900 hover:underline">
              <Mail className="h-3.5 w-3.5" /> {CONTACT.email}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Plane;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-5 w-5 text-brand-900" />
        <h2 className="text-xl font-bold text-brand-900">{title}</h2>
      </div>
      <p className="text-sm text-brand-500">{description}</p>
    </div>
  );
}

function Field({
  label,
  error,
  helpText,
  children,
}: {
  label: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-brand-800">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </span>
      ) : helpText ? (
        <span className="mt-1 block text-xs text-brand-400">{helpText}</span>
      ) : null}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm text-brand-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-900/10 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-500"
      : "border-brand-200 bg-white focus:border-brand-900"
  }`;
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-500">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-brand-500">{label}</span>
      <span className="text-right font-medium text-brand-900">{value}</span>
    </div>
  );
}
