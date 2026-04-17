"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  cruiseReservationSchema,
  type CruiseReservationInput,
} from "@/lib/validations";
import { CRUISE_LINES, TERMINALS } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CruiseBookingForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CruiseReservationInput>({
    resolver: zodResolver(cruiseReservationSchema),
    defaultValues: {
      passengers: 1,
    },
  });

  async function onSubmit(data: CruiseReservationInput) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/payments/cruise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Error al crear la reserva");
      }

      const result = await res.json();
      if (result.initPoint) {
        // Redirect to Mercado Pago
        window.location.href = result.initPoint;
      } else {
        router.push(`/reservar/cruceros/confirmacion?id=${result.reservationId}`);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Error inesperado. Intentá de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Personal info */}
      <fieldset>
        <legend className="mb-4 text-lg font-bold text-brand-900">
          Datos personales
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" error={errors.firstName?.message}>
            <input
              {...register("firstName")}
              type="text"
              placeholder="Juan"
              className={inputClass(errors.firstName)}
            />
          </FormField>
          <FormField label="Apellido" error={errors.lastName?.message}>
            <input
              {...register("lastName")}
              type="text"
              placeholder="Pérez"
              className={inputClass(errors.lastName)}
            />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="juan@email.com"
              className={inputClass(errors.email)}
            />
          </FormField>
          <FormField label="Teléfono (opcional)" error={errors.phone?.message}>
            <input
              {...register("phone")}
              type="tel"
              placeholder="+54 11 1234-5678"
              className={inputClass(errors.phone)}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Trip info */}
      <fieldset>
        <legend className="mb-4 text-lg font-bold text-brand-900">
          Datos del viaje
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Fecha de salida"
            error={errors.departureDate?.message}
          >
            <input
              {...register("departureDate")}
              type="date"
              className={inputClass(errors.departureDate)}
            />
          </FormField>
          <FormField
            label="Hora estimada de llegada al parking"
            error={errors.arrivalTime?.message}
          >
            <input
              {...register("arrivalTime")}
              type="time"
              className={inputClass(errors.arrivalTime)}
            />
          </FormField>
          <FormField
            label="Fecha de regreso"
            error={errors.returnDate?.message}
          >
            <input
              {...register("returnDate")}
              type="date"
              className={inputClass(errors.returnDate)}
            />
          </FormField>
          <FormField
            label="Hora estimada de retiro del auto"
            error={errors.pickupTime?.message}
          >
            <input
              {...register("pickupTime")}
              type="time"
              className={inputClass(errors.pickupTime)}
            />
          </FormField>
          <FormField
            label="Cantidad de pasajeros"
            error={errors.passengers?.message}
          >
            <input
              {...register("passengers", { valueAsNumber: true })}
              type="number"
              min={1}
              max={20}
              className={inputClass(errors.passengers)}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Vehicle info */}
      <fieldset>
        <legend className="mb-4 text-lg font-bold text-brand-900">
          Datos del vehículo
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Patente" error={errors.licensePlate?.message}>
            <input
              {...register("licensePlate")}
              type="text"
              placeholder="AB 123 CD"
              className={cn(inputClass(errors.licensePlate), "uppercase")}
            />
          </FormField>
          <FormField label="Marca" error={errors.carBrand?.message}>
            <input
              {...register("carBrand")}
              type="text"
              placeholder="Toyota"
              className={inputClass(errors.carBrand)}
            />
          </FormField>
          <FormField label="Modelo" error={errors.carModel?.message}>
            <input
              {...register("carModel")}
              type="text"
              placeholder="Corolla"
              className={inputClass(errors.carModel)}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Cruise info (optional) */}
      <fieldset>
        <legend className="mb-1 text-lg font-bold text-brand-900">
          Datos del crucero
        </legend>
        <p className="mb-4 text-sm text-brand-400">Opcional</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Naviera / Crucero" error={errors.cruiseLine?.message}>
            <select {...register("cruiseLine")} className={inputClass()}>
              <option value="">Seleccionar (opcional)</option>
              {CRUISE_LINES.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Terminal" error={errors.terminal?.message}>
            <select {...register("terminal")} className={inputClass()}>
              <option value="">Seleccionar (opcional)</option>
              {TERMINALS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset>
        <legend className="mb-4 text-lg font-bold text-brand-900">
          Observaciones
        </legend>
        <FormField label="Notas adicionales" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Información adicional que quieras compartir..."
            className={inputClass(errors.notes)}
          />
        </FormField>
      </fieldset>

      {/* Submit */}
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          "Continuar al pago"
        )}
      </button>

      <p className="text-center text-xs text-brand-400">
        Al continuar serás redirigido a <strong>Mercado Pago</strong> para completar el pago de forma segura.
      </p>
    </form>
  );
}

// --- Helper components ---

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-brand-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(error?: { message?: string }) {
  return cn(
    "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors",
    error ? "border-red-300 focus:ring-red-500" : "border-brand-200"
  );
}
