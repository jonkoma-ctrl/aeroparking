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
 * Extract value after a label in AA2000 emails.
 * Gmail getPlainBody() format: `- *Label:*\n\n   Value` or `*Label:* Value`
 * Raw .eml format: `*\tLabel:\n\n\n\tValue`
 */
function extractField(body: string, label: string): string | null {
  // Strip trailing colon from label for flexible matching
  const baseLabel = label.replace(/:$/, "");
  const escaped = baseLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Pattern 1: Gmail bold format — `*Label:*` followed by value on next non-empty line
  // e.g. `- *Patente n°:*\n\n   ODE588`
  const gmailBold = new RegExp(`\\*${escaped}:\\*[\\t ]*\\n[\\s]*?([^\\n\\-\\*][^\\n]*)`, "im");
  const m1 = body.match(gmailBold);
  if (m1) {
    const val = m1[1].trim();
    if (val) return val;
  }

  // Pattern 2: Gmail bold inline — `*Label:* Value` on same line
  const gmailInline = new RegExp(`\\*${escaped}:\\*\\s+([^\\n]+)`, "i");
  const m2 = body.match(gmailInline);
  if (m2) {
    const val = m2[1].trim();
    if (val) return val;
  }

  // Pattern 3: Raw .eml format — `Label:\n\n\n\tValue`
  const rawEml = new RegExp(`${escaped}:[\\t ]*\\n[\\s]*?([^\\n\\*\\-][^\\n]*)`, "im");
  const m3 = body.match(rawEml);
  if (m3) {
    const val = m3[1].trim();
    if (val) return val;
  }

  // Pattern 4: Plain inline — `Label: Value`
  const plain = new RegExp(`${escaped}:\\s+([^\\n]+)`, "i");
  const m4 = body.match(plain);
  if (m4) {
    const val = m4[1].trim();
    if (val) return val;
  }

  return null;
}

/**
 * Parse DD/MM/YYYY or DD/MM/YYYY HH:MM into a Date
 */
function parseDateDMY(str: string): Date | null {
  const m = str.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const year = parseInt(m[3], 10);
  const hour = m[4] ? parseInt(m[4], 10) : 0;
  const minute = m[5] ? parseInt(m[5], 10) : 0;
  return new Date(year, month, day, hour, minute);
}

/**
 * Parse price string like "$ 214.000" or "$214.000" or "214.000" → 214000
 */
function parsePrice(str: string): number {
  // Remove everything except digits
  const digits = str.replace(/[^\d]/g, "");
  return parseInt(digits, 10) || 0;
}

/**
 * Try to find Argentine license plate in text.
 * Formats: AA000BB (new) or AAA000 (old)
 */
function findLicensePlate(text: string): string | null {
  const m = text.match(/\b([A-Z]{2}\d{3}[A-Z]{2})\b/i) ||
            text.match(/\b([A-Z]{3}\d{3})\b/i);
  return m ? m[1].toUpperCase() : null;
}

/**
 * Parse an AA2000 WooCommerce confirmation email (plain text).
 * Returns null if critical fields can't be extracted.
 * Logs which field failed for debugging.
 */
export function parseAeroparqueEmail(
  subject: string,
  body: string
): ParsedAeroparqueEmail | null {
  const fail = (field: string) => {
    console.error(`[email-parser] Failed to extract: ${field}`);
    console.error(`[email-parser] Subject: ${subject.slice(0, 120)}`);
    console.error(`[email-parser] Body preview (500 chars): ${body.slice(0, 500)}`);
    return null;
  };

  // Order ID from subject: "(177666)" or "#177666"
  const orderMatch = subject.match(/\((\d+)\)/) || subject.match(/#(\d+)/);
  if (!orderMatch) return fail("orderId");
  const externalOrderId = orderMatch[1];

  // Customer name: "Has recibido un pedido de Axel Mauhourat."
  // Also try: "pedido de Axel Mauhourat" without trailing dot
  const nameMatch = body.match(/pedido de\s+(.+?)\s*\./i) ||
                    body.match(/pedido de\s+([^\n]+)/i);
  if (!nameMatch) return fail("customerName");
  const customerName = nameMatch[1].trim();

  // Service type — handle various forms
  let serviceType: AeroparqueServiceType;
  if (/Drop\s*[&y]\s*Go/i.test(body) || /Drop\s*&amp;\s*Go/i.test(body)) {
    serviceType = "drop_go";
  } else if (/Larga\s+Estad[ií]a/i.test(body)) {
    serviceType = "larga_estadia";
  } else {
    return fail("serviceType");
  }

  // Vehicle — try extractField first, then regex fallback
  // Handle both n° (degree sign U+00B0) and nº (ordinal indicator U+00BA) and n:
  let licensePlate = extractField(body, "Patente n°:") ||
                     extractField(body, "Patente nº:") ||
                     extractField(body, "Patente n:") ||
                     extractField(body, "Patente:");
  // Fallback: find plate pattern near "Patente" keyword
  if (!licensePlate) {
    const plateSection = body.match(/Patente[^\n]*\n([\s\S]{0,100})/i);
    if (plateSection) licensePlate = findLicensePlate(plateSection[1]);
  }
  if (!licensePlate) return fail("licensePlate");

  const carBrand = extractField(body, "Marca:");
  if (!carBrand) return fail("carBrand");

  const carModel = extractField(body, "Modelo:");
  if (!carModel) return fail("carModel");

  // Dates
  const startDateStr = extractField(body, "Reservado desde:");
  const endDateStr = extractField(body, "Reservado hasta:");
  if (!startDateStr) return fail("startDate");
  if (!endDateStr) return fail("endDate");

  const startDate = parseDateDMY(startDateStr);
  const endDate = parseDateDMY(endDateStr);
  if (!startDate) return fail("startDate (parse)");
  if (!endDate) return fail("endDate (parse)");

  // Price — multiple strategies
  let price = 0;
  // Try "Total:" followed by price
  const totalMatch = body.match(/Total[:\s]*\$?\s*([\d.]+)/i);
  if (totalMatch) {
    price = parsePrice(totalMatch[1]);
  }
  // Fallback: find the last/largest $ amount
  if (price === 0) {
    const allPrices = [...body.matchAll(/\$\s*([\d.]+)/g)];
    if (allPrices.length > 0) {
      const amounts = allPrices.map(m => parsePrice(m[1]));
      price = Math.max(...amounts);
    }
  }

  // Flight info (all optional — never fail on these)
  const departureAirline = extractField(body, "Aerolínea:") ||
                           extractField(body, "Aerolinea:") ||
                           extractField(body, "Aerol\u00ednea:");
  const departureFlight = extractField(body, "Número de vuelo:") ||
                          extractField(body, "Numero de vuelo:") ||
                          extractField(body, "N\u00famero de vuelo:");
  const arrivalAirline = extractField(body, "Línea aérea de arribo:") ||
                         extractField(body, "Linea aerea de arribo:") ||
                         extractField(body, "L\u00ednea a\u00e9rea de arribo:");
  const arrivalFlight = extractField(body, "N° de vuelo de arribo:") ||
                        extractField(body, "Nº de vuelo de arribo:") ||
                        extractField(body, "N\u00b0 de vuelo de arribo:");
  const arrivalTime = extractField(body, "Horario de arribo:");

  // Departure flight date
  const depDateStr = extractField(body, "Fecha de salida:");
  const departureFlightDate = depDateStr ? parseDateDMY(depDateStr) : null;

  // Passengers
  const passStr = extractField(body, "Cantidad de pasajeros:");
  const passengers = passStr ? parseInt(passStr, 10) || null : null;

  // DNI
  const dni = extractField(body, "Número de documento:") ||
              extractField(body, "Numero de documento:") ||
              extractField(body, "N\u00famero de documento:");

  // Email — find customer email, skip system addresses
  let email: string | null = null;
  const allEmails = body.match(/[\w.-]+@[\w.-]+\.\w{2,}/g) || [];
  for (const e of allEmails) {
    if (!e.includes("nrauditores") &&
        !e.includes("tiendaaeropuertos") &&
        !e.includes("aeropuertosargentina")) {
      email = e;
      break;
    }
  }

  // Phone
  let phone: string | null = null;
  const phoneMatch = body.match(/\+\d{10,15}/);
  if (phoneMatch) phone = phoneMatch[0];

  // Notes
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
