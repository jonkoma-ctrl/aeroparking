/**
 * Parser para mails de AA2000 (Tienda online Aeropuertos Argentina)
 *
 * Extrae datos de reservas desde el body text/plain de los mails
 * que llegan a reservas@nrauditores.com.ar
 *
 * Formatos soportados:
 * - "Drop & Go" (Valet Parking)
 * - "Larga Estadía - Costa Salguero (de 4 a 14 días)"
 */

export interface ParsedAeroparqueEmail {
  externalOrderId: string;
  serviceType: "drop_go" | "larga_estadia";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string | null;
  documentNumber: string | null;
  departureDate: string; // DD/MM/YYYY
  airline: string;
  flightNumber: string;
  returnAirline: string | null;
  returnFlight: string | null;
  arrivalTime: string | null;
  entryTime: string | null;
  reservedFrom: string; // DD/MM/YYYY or DD/MM/YYYY HH:mm
  reservedUntil: string;
  passengers: number;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  totalAmount: number;
  paymentMethod: string | null;
  paymentStatus: string;
  billingAddress: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingZip: string | null;
  notes: string | null;
  rawEmailSubject: string;
}

/**
 * Extrae un campo del text/plain del mail.
 * Los mails de AA2000 usan este formato:
 *
 * *  Campo:
 *
 *     Valor
 */
function extractField(text: string, fieldName: string): string | null {
  // Pattern 1: "* Campo:\n\n\tValor" (formato AA2000)
  const pattern1 = new RegExp(
    `\\*\\s*${escapeRegex(fieldName)}[:\\s]*\\n+\\s*([^\\n*]+)`,
    "i"
  );
  const match1 = text.match(pattern1);
  if (match1) return match1[1].trim();

  // Pattern 2: "Campo: Valor" inline
  const pattern2 = new RegExp(`${escapeRegex(fieldName)}[:\\s]+([^\\n]+)`, "i");
  const match2 = text.match(pattern2);
  if (match2) return match2[1].trim();

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parsea una fecha en formato DD/MM/YYYY o DD/MM/YYYY HH:mm a Date
 */
export function parseDateAR(dateStr: string): Date {
  // DD/MM/YYYY HH:mm
  const withTime = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
  if (withTime) {
    return new Date(
      parseInt(withTime[3]),
      parseInt(withTime[2]) - 1,
      parseInt(withTime[1]),
      parseInt(withTime[4]),
      parseInt(withTime[5])
    );
  }
  // DD/MM/YYYY
  const dateOnly = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dateOnly) {
    return new Date(
      parseInt(dateOnly[3]),
      parseInt(dateOnly[2]) - 1,
      parseInt(dateOnly[1])
    );
  }
  throw new Error(`Fecha no válida: ${dateStr}`);
}

/**
 * Extrae monto en pesos del formato "$ 214.000"
 */
function parseAmount(text: string): number {
  const match = text.match(/\$\s*([\d.]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/\./g, ""), 10);
}

/**
 * Parsea el body text/plain de un mail de AA2000
 */
export function parseAeroparqueEmail(
  body: string,
  subject: string
): ParsedAeroparqueEmail {
  // Extraer Order ID del subject: "Nuevo pedido de cliente (177666)"
  const orderMatch = subject.match(/\((\d+)\)/);
  if (!orderMatch) {
    throw new Error("No se pudo extraer el ID de pedido del subject");
  }
  const externalOrderId = orderMatch[1];

  // Detectar tipo de servicio
  const isLargaEstadia =
    body.includes("Larga Estadía") || body.includes("Larga Estadia");
  const serviceType: "drop_go" | "larga_estadia" = isLargaEstadia
    ? "larga_estadia"
    : "drop_go";

  // Extraer nombre del cliente: "Has recibido un pedido de Nombre Apellido."
  const nameMatch = body.match(
    /Has recibido un pedido de\s+([^.]+)\./
  );
  let firstName = "";
  let lastName = "";
  if (nameMatch) {
    const parts = nameMatch[1].trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  // Extraer datos del pedido
  const licensePlate = extractField(body, "Patente n°") || extractField(body, "Patente") || "";
  const carBrand = extractField(body, "Marca") || "";
  const carModel = extractField(body, "Modelo") || "";
  const passengersStr = extractField(body, "Cantidad de pasajeros") || "1";
  const passengers = parseInt(passengersStr, 10) || 1;
  const returnAirline = extractField(body, "Línea aérea de arribo") || null;
  const returnFlight = extractField(body, "N° de vuelo de arribo") || extractField(body, "vuelo de arribo") || null;
  const arrivalTime = extractField(body, "Horario de arribo") || null;
  const entryTime = extractField(body, "Horario de ingreso") || null;
  const reservedFrom = extractField(body, "Reservado desde") || "";
  const reservedUntil = extractField(body, "Reservado hasta") || "";

  // Fecha de salida y vuelo de salida (del encabezado del producto)
  const departureDateMatch = body.match(/Fecha de salida:\s*(\d{2}\/\d{2}\/\d{4})/);
  const departureDate = departureDateMatch ? departureDateMatch[1] : reservedFrom;

  const airlineMatch = body.match(/Aerolínea:\s*([^\n]+)/);
  const airline = airlineMatch ? airlineMatch[1].trim() : "";

  const flightMatch = body.match(/Número de vuelo:\s*([^\n]+)/);
  const flightNumber = flightMatch ? flightMatch[1].trim() : "";

  // Estado de reserva y pago
  const reservationStatus = extractField(body, "Estado de la Reserva") || "";
  const paymentStatus = reservationStatus.toLowerCase().includes("pagado")
    ? "paid"
    : "pending";

  // Total
  const totalMatch = body.match(/Total:\s*\n?\$\s*([\d.]+)/);
  const totalAmount = totalMatch
    ? parseInt(totalMatch[1].replace(/\./g, ""), 10)
    : 0;

  // Método de pago
  const paymentMethodMatch = body.match(/Método\s*\n?de pago:\s*([^\n]+)/);
  const paymentMethod = paymentMethodMatch
    ? paymentMethodMatch[1].trim()
    : null;

  // Documento
  const docTypeMatch = body.match(/Tipo de Documento:\s*([^\n]+)/);
  const documentType = docTypeMatch ? docTypeMatch[1].trim() : null;
  const docNumberMatch = body.match(/Número de documento:\s*([^\n]+)/);
  const documentNumber = docNumberMatch ? docNumberMatch[1].trim() : null;

  // Dirección de facturación (bloque después de "Dirección de facturación")
  let billingAddress: string | null = null;
  let billingCity: string | null = null;
  let billingState: string | null = null;
  let billingZip: string | null = null;
  let email = "";
  let phone = "";

  const billingBlock = body.match(
    /Dirección de facturación\s*\n+([\s\S]*?)(?:\n\s*_|$)/
  );
  if (billingBlock) {
    const lines = billingBlock[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    // Format: Name, Address, City, State, ZIP, Country, Phone, Email
    if (lines.length >= 2) billingAddress = lines[1] || null;
    if (lines.length >= 3) billingCity = lines[2] || null;
    if (lines.length >= 4) billingState = lines[3] || null;
    if (lines.length >= 5) billingZip = lines[4] || null;
    // Phone is usually with + prefix
    const phoneLine = lines.find((l) => l.startsWith("+"));
    if (phoneLine) phone = phoneLine;
    // Email
    const emailLine = lines.find((l) => l.includes("@"));
    if (emailLine) email = emailLine;
  }

  // Notas del cliente (campo "Nota:")
  const notesMatch = body.match(/Nota:\s*\n?([^\n](?:[\s\S]*?)?)(?:\s*Tipo de Documento|$)/);
  const notes = notesMatch ? notesMatch[1].trim() : null;

  return {
    externalOrderId,
    serviceType,
    firstName,
    lastName,
    email,
    phone,
    documentType,
    documentNumber,
    departureDate,
    airline,
    flightNumber,
    returnAirline,
    returnFlight,
    arrivalTime,
    entryTime,
    reservedFrom,
    reservedUntil,
    passengers,
    licensePlate,
    carBrand,
    carModel,
    totalAmount,
    paymentMethod,
    paymentStatus,
    billingAddress,
    billingCity,
    billingState,
    billingZip,
    notes,
    rawEmailSubject: subject,
  };
}

/**
 * Detecta si un mail es una cancelación
 * Los mails de cancelación suelen tener "cancelado" o "cancelled" en el subject/body
 */
export function isCancellationEmail(subject: string, body: string): boolean {
  const text = `${subject} ${body}`.toLowerCase();
  return (
    text.includes("cancelado") ||
    text.includes("cancelled") ||
    text.includes("cancelación") ||
    text.includes("cancellation") ||
    text.includes("reembolso") ||
    text.includes("arrepentimiento")
  );
}
