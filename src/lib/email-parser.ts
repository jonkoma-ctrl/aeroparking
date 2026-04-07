export type AeroparqueServiceType = "drop_go" | "larga_estadia";

export interface ParsedAeroparqueEmail {
  externalOrderId: string;
  serviceType: AeroparqueServiceType;
  customerName: string;
  email: string | null;
  phone: string | null;
  dni: string | null;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  startDate: Date;
  endDate: Date;
  price: number;
  departureFlightDate: Date | null;
  departureAirline: string | null;
  departureFlight: string | null;
  arrivalAirline: string | null;
  arrivalFlight: string | null;
  arrivalTime: string | null;
  passengers: number | null;
  notes: string | null;
}

/**
 * Extract value after a label in AA2000 plain-text emails.
 * Pattern: `*\tLabel:\n\n\n\tValue` or just `Label:\n...\nValue`
 */
function extractField(body: string, label: string): string | null {
  // Try pattern: label followed by value on next non-empty line
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}\\s*\\n+\\s*\\n*\\s*(.+)`, "i");
  const match = body.match(regex);
  if (match) return match[1].trim();
  return null;
}

/**
 * Parse DD/MM/YYYY or DD/MM/YYYY HH:MM into a Date
 */
function parseDateDMY(str: string): Date | null {
  // Match DD/MM/YYYY optionally followed by HH:MM
  const m = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const year = parseInt(m[3], 10);
  const hour = m[4] ? parseInt(m[4], 10) : 0;
  const minute = m[5] ? parseInt(m[5], 10) : 0;
  return new Date(year, month, day, hour, minute);
}

/**
 * Parse price string like "$ 214.000" → 214000
 */
function parsePrice(str: string): number {
  const cleaned = str.replace(/[$.\\s\u00a0]/g, "").replace(/\./g, "").trim();
  return parseInt(cleaned, 10) || 0;
}

/**
 * Parse an AA2000 WooCommerce confirmation email (plain text).
 * Returns null if critical fields can't be extracted.
 */
export function parseAeroparqueEmail(
  subject: string,
  body: string
): ParsedAeroparqueEmail | null {
  // Order ID from subject: "Nuevo pedido de cliente (177666)"
  const orderMatch = subject.match(/\((\d+)\)/);
  if (!orderMatch) return null;
  const externalOrderId = orderMatch[1];

  // Customer name: "Has recibido un pedido de Axel Mauhourat."
  const nameMatch = body.match(/pedido de (.+?)\./i);
  if (!nameMatch) return null;
  const customerName = nameMatch[1].trim();

  // Service type
  let serviceType: AeroparqueServiceType;
  if (/Drop\s*&\s*Go/i.test(body)) {
    serviceType = "drop_go";
  } else if (/Larga\s+Estad[ií]a/i.test(body)) {
    serviceType = "larga_estadia";
  } else {
    return null;
  }

  // Vehicle
  const licensePlate = extractField(body, "Patente n°:");
  if (!licensePlate) return null;

  const carBrand = extractField(body, "Marca:");
  if (!carBrand) return null;

  const carModel = extractField(body, "Modelo:");
  if (!carModel) return null;

  // Dates
  const startDateStr = extractField(body, "Reservado desde:");
  const endDateStr = extractField(body, "Reservado hasta:");
  if (!startDateStr || !endDateStr) return null;

  const startDate = parseDateDMY(startDateStr);
  const endDate = parseDateDMY(endDateStr);
  if (!startDate || !endDate) return null;

  // Price — get from "Total:" line or last $ amount
  let price = 0;
  const totalMatch = body.match(/Total:\s*\n?\s*\$\s*([\d.]+)/i);
  if (totalMatch) {
    price = parsePrice(totalMatch[1]);
  } else {
    // Fallback: find "- \t$ NNN.NNN" pattern
    const priceMatches = body.match(/\$\s*([\d.]+)/g);
    if (priceMatches && priceMatches.length > 0) {
      const last = priceMatches[priceMatches.length - 1];
      price = parsePrice(last);
    }
  }

  // Flight info (optional)
  const departureAirline = extractField(body, "Aerolínea:") || extractField(body, "Aerolinea:");
  const departureFlight = extractField(body, "Número de vuelo:") || extractField(body, "Numero de vuelo:");
  const arrivalAirline = extractField(body, "Línea aérea de arribo:") || extractField(body, "Linea aerea de arribo:");
  const arrivalFlight = extractField(body, "N° de vuelo de arribo:");
  const arrivalTime = extractField(body, "Horario de arribo:");

  // Departure flight date
  const depDateStr = extractField(body, "Fecha de salida:");
  const departureFlightDate = depDateStr ? parseDateDMY(depDateStr) : null;

  // Passengers
  const passStr = extractField(body, "Cantidad de pasajeros:");
  const passengers = passStr ? parseInt(passStr, 10) || null : null;

  // DNI
  const dni = extractField(body, "Número de documento:") || extractField(body, "Numero de documento:");

  // Email & phone from billing address section
  let email: string | null = null;
  const emailMatch = body.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) {
    const found = emailMatch[0];
    // Skip known system emails
    if (!found.includes("nrauditores") && !found.includes("tiendaaeropuertos")) {
      email = found;
    }
  }

  let phone: string | null = null;
  const phoneMatch = body.match(/\+\d{10,15}/);
  if (phoneMatch) phone = phoneMatch[0];

  // Notes from "Nota:" field in email footer
  const notesMatch = body.match(/Nota:\s*\n?\s*([^\n]+)/i);
  const notes = notesMatch ? notesMatch[1].trim() : null;

  return {
    externalOrderId,
    serviceType,
    customerName,
    email,
    phone,
    dni,
    licensePlate: licensePlate.toUpperCase(),
    carBrand,
    carModel,
    startDate,
    endDate,
    price,
    departureFlightDate,
    departureAirline,
    departureFlight,
    arrivalAirline,
    arrivalFlight,
    arrivalTime,
    passengers,
    notes,
  };
}
