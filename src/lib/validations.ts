import { z } from "zod";

// ─── Schema legacy: reserva de cruceros (/reservar/cruceros) ────────────────

export const cruiseReservationSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50),
    lastName: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50),
    email: z.string().email("Ingresá un email válido"),
    phone: z.string().max(20).optional().or(z.literal("")),
    departureDate: z.string().min(1, "Seleccioná la fecha de salida"),
    arrivalTime: z.string().min(1, "Seleccioná la hora de llegada al parking"),
    returnDate: z.string().min(1, "Seleccioná la fecha de regreso"),
    pickupTime: z.string().min(1, "Seleccioná la hora de retiro del auto"),
    passengers: z
      .number({ invalid_type_error: "Ingresá la cantidad de pasajeros" })
      .min(1, "Mínimo 1 pasajero")
      .max(20, "Máximo 20 pasajeros"),
    licensePlate: z
      .string()
      .min(6, "Ingresá una patente válida")
      .max(10)
      .transform((v) => v.toUpperCase()),
    carBrand: z.string().min(2, "Ingresá la marca del vehículo"),
    carModel: z.string().min(1, "Ingresá el modelo del vehículo"),
    cruiseLine: z.string().optional(),
    terminal: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      const dep = new Date(data.departureDate);
      const ret = new Date(data.returnDate);
      return ret > dep;
    },
    {
      message: "La fecha de regreso debe ser posterior a la de salida",
      path: ["returnDate"],
    }
  )
  .refine(
    (data) => {
      const dep = new Date(data.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dep >= today;
    },
    {
      message: "La fecha de salida no puede ser anterior a hoy",
      path: ["departureDate"],
    }
  );

export type CruiseReservationInput = z.infer<typeof cruiseReservationSchema>;

// ─── Schema nuevo: reserva presencial multi-destino ──────────────────────────
// Usado por POST /api/reservas/presencial y por <PresentialBookingForm />.
// Pago presencial: NO redirige a MercadoPago, se cobra al dejar el vehículo.

const PATENTE_REGEX = /^[A-Z0-9]{6,8}$/i;

export const presentialReservationSchema = z
  .object({
    // Servicio
    destination: z.enum(["aeroparque", "ezeiza", "puerto"], {
      errorMap: () => ({ message: "Destino inválido" }),
    }),
    serviceType: z.enum(["drop_go", "larga_estadia", "cruceros"]),

    // Cliente
    firstName: z.string().min(2, "Nombre demasiado corto").max(50),
    lastName: z.string().min(2, "Apellido demasiado corto").max(50),
    email: z.string().email("Email inválido").max(120),
    /// Teléfono / WhatsApp del cliente.
    phone: z
      .string()
      .min(8, "Teléfono incompleto")
      .max(20, "Teléfono demasiado largo"),

    // Vehículo
    licensePlate: z
      .string()
      .min(6, "Patente inválida")
      .max(10, "Patente inválida")
      .transform((v) => v.replace(/\s+/g, "").toUpperCase())
      .refine((v) => PATENTE_REGEX.test(v), "Formato de patente inválido"),
    carBrand: z.string().min(2, "Ingresá la marca").max(40),
    carModel: z.string().min(1, "Ingresá el modelo").max(40),
    passengers: z.number().int().min(1).max(20).default(1),

    // Reserva
    /// Fecha de ingreso al estacionamiento (YYYY-MM-DD).
    startDate: z.string().min(1, "Seleccioná la fecha de ingreso"),
    /// Hora estimada de ingreso (HH:MM).
    checkInTime: z.string().min(1, "Seleccioná la hora de ingreso"),
    /// Fecha de retiro del vehículo (YYYY-MM-DD).
    endDate: z.string().min(1, "Seleccioná la fecha de retiro"),
    /// Hora estimada de retiro / arribo del vuelo (HH:MM).
    arrivalTime: z.string().min(1, "Seleccioná la hora de retiro"),

    // Vuelo (Aeroparque / Ezeiza)
    departureAirline: z.string().max(40).optional().or(z.literal("")),
    departureFlight: z.string().max(20).optional().or(z.literal("")),
    arrivalAirline: z.string().max(40).optional().or(z.literal("")),
    arrivalFlight: z.string().max(20).optional().or(z.literal("")),

    // Crucero (Puerto)
    cruiseLine: z.string().max(60).optional().or(z.literal("")),
    terminal: z.string().max(60).optional().or(z.literal("")),

    // Observaciones
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.startDate}T${data.checkInTime || "00:00"}`);
      const end = new Date(`${data.endDate}T${data.arrivalTime || "00:00"}`);
      return end > start;
    },
    {
      message: "La fecha y hora de retiro debe ser posterior al ingreso",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(`${data.startDate}T${data.checkInTime || "00:00"}`);
      const minStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      return start >= minStart;
    },
    {
      message:
        "Las reservas online se aceptan con al menos 24hs de anticipación. Para urgencias, llamanos.",
      path: ["startDate"],
    }
  );

export type PresentialReservationInput = z.infer<typeof presentialReservationSchema>;
