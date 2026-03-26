import { z } from "zod";

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
    phone: z
      .string()
      .min(8, "Ingresá un teléfono válido")
      .max(20),
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
