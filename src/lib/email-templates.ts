import { formatDate, formatPrice, getServiceTypeLabel } from "./utils";

interface ReservationEmailData {
  customerName: string;
  externalOrderId?: string;
  reservationId?: string;
  destination: string;
  serviceType: string;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  startDate: Date | string;
  endDate: Date | string;
  checkInTime?: string | null;
  arrivalTime?: string | null;
  departureAirline?: string | null;
  departureFlight?: string | null;
  arrivalAirline?: string | null;
  arrivalFlight?: string | null;
  price?: number | null;
  passengers?: number | null;
}

const SITE_URL = "https://aeroparking.vercel.app";
const MAPS_COSTA_SALGUERO = "https://maps.app.goo.gl/kZQH9UpSa5zGYxY5A";
const MAPS_AEROPARQUE = "https://www.google.com/maps?q=-34.5556682,-58.4150684&z=17&hl=es";
const WA_PHONE = "5491131606994";

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 12px;color:#6b7280;border-bottom:1px solid #f3f4f6">${label}</td><td style="padding:8px 12px;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6;text-align:right">${value}</td></tr>`;
}

export function buildReservationEmail(data: ReservationEmailData): string {
  const orderRef = data.externalOrderId
    ? `Pedido #${data.externalOrderId}`
    : `Reserva ${data.reservationId?.slice(0, 8) || ""}`;

  const lookupParam = data.externalOrderId
    ? `order=${data.externalOrderId}`
    : `id=${data.reservationId}`;

  const isPuerto = data.destination === "puerto";
  const isCruceros = data.serviceType === "cruceros";
  const startStr = formatDate(data.startDate);
  const endStr = formatDate(data.endDate);

  // Build reservation rows
  let rows = "";
  rows += row("Referencia", orderRef);
  rows += row("Servicio", getServiceTypeLabel(data.serviceType));
  rows += row("Destino", isPuerto ? "Puerto de Buenos Aires" : "Aeroparque Jorge Newbery");
  rows += row(isCruceros ? "Embarque" : "Ingreso", `${startStr}${data.checkInTime ? ` — ${data.checkInTime} hs` : ""}`);
  rows += row(isCruceros ? "Desembarque" : "Retiro", `${endStr}${data.arrivalTime ? ` — ${data.arrivalTime} hs` : ""}`);
  rows += row("Vehículo", `${data.licensePlate} — ${data.carBrand} ${data.carModel}`);

  // Solo mostrar vuelos para Aeroparque (no cruceros)
  if (!isCruceros && (data.departureAirline || data.departureFlight)) {
    rows += row("Vuelo salida", [data.departureAirline, data.departureFlight].filter(Boolean).join(" "));
  }
  if (!isCruceros && (data.arrivalAirline || data.arrivalFlight)) {
    rows += row("Vuelo arribo", [data.arrivalAirline, data.arrivalFlight].filter(Boolean).join(" "));
  }
  if (data.passengers) {
    rows += row("Pasajeros", String(data.passengers));
  }
  if (data.price && data.price > 0) {
    rows += row("Precio", formatPrice(data.price));
  }

  // Instructivo según destino
  const instructivo = isPuerto
    ? `
      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:20px;margin-top:24px">
        <h3 style="margin:0 0 12px;color:#0d9488;font-size:16px">📍 Estacionamiento Costa Salguero</h3>
        <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6">
          ¡Tu lugar en el Estacionamiento de Costa Salguero ya está reservado!
        </p>
        <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6">
          <strong>Dirección:</strong> Av. Costanera Rafael Obligado, Costa Salguero, CABA
        </p>
        <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">
          <strong>Importante:</strong>
        </p>
        <ul style="margin:0 0 12px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
          <li>Presentate con anticipación en el estacionamiento de Costa Salguero</li>
          <li>El traslado hacia Aeroparque tiene una duración de 15 minutos</li>
          <li>Para modificaciones, cancelaciones o solicitudes especiales, comunicate 24 horas antes</li>
        </ul>
        <a href="${MAPS_COSTA_SALGUERO}" style="display:inline-block;background:#0d9488;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          📌 Ver ubicación en Google Maps
        </a>
      </div>
    `
    : `
      <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:20px;margin-top:24px">
        <h3 style="margin:0 0 12px;color:#4f46e5;font-size:16px">✈️ Aeroparque Jorge Newbery</h3>
        <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6">
          El stand de <strong>Drop & Go</strong> se encuentra ubicado en la <strong>zona de Partidas</strong>.
        </p>
        <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.6">
          Para confirmar tu reserva, contactate con el servicio de Valet Parking.
        </p>
        <a href="${MAPS_AEROPARQUE}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
          📌 Ver ubicación en Google Maps
        </a>
      </div>
    `;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:20px">

    <!-- Header -->
    <div style="background:#111827;border-radius:12px 12px 0 0;padding:24px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px">
        AERO<span style="color:#6b7280">PARKING</span>
      </h1>
      <p style="margin:8px 0 0;color:#9ca3af;font-size:13px">Parking y Traslados | Aeroparque & Cruceros</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">

      <h2 style="margin:0 0 8px;color:#111827;font-size:20px">¡Hola ${data.customerName}!</h2>
      <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.5">
        Tu reserva fue recibida correctamente. A continuación encontrarás los detalles.
      </p>

      <!-- Código de reserva destacado -->
      <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center">
        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px">Tu código de reserva</p>
        <p style="margin:0;color:#111827;font-size:28px;font-weight:700;letter-spacing:2px">${data.externalOrderId || data.reservationId?.slice(0, 8) || ""}</p>
        <p style="margin:8px 0 0;color:#6b7280;font-size:12px">Usá este código para gestionar tu reserva</p>
      </div>

      <!-- Reservation table -->
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows}
      </table>

      <!-- Instructivo -->
      ${instructivo}

      <!-- CTA -->
      <div style="text-align:center;margin-top:32px">
        <a href="${SITE_URL}/mi-reserva?${lookupParam}" style="display:inline-block;background:#111827;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600">
          Gestionar mi reserva
        </a>
      </div>

      <!-- Contact -->
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;text-align:center">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px">¿Necesitás ayuda?</p>
        <p style="margin:0;color:#374151;font-size:14px">
          <a href="https://wa.me/${WA_PHONE}" style="color:#111827;font-weight:600;text-decoration:none">
            WhatsApp 11-3160-6994
          </a>
          &nbsp;/&nbsp;
          <a href="https://wa.me/5491153228770" style="color:#111827;font-weight:600;text-decoration:none">
            11-5322-8770
          </a>
        </p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px">
          reservas@nrauditores.com.ar
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6;border-radius:0 0 12px 12px;padding:16px;text-align:center;border:1px solid #e5e7eb;border-top:0">
      <p style="margin:0;color:#9ca3af;font-size:12px">
        © 2026 AEROPARKING — By JonKoma
      </p>
    </div>

  </div>
</body>
</html>
  `;
}

export function getReservationEmailSubject(data: { customerName: string; destination: string; externalOrderId?: string }) {
  const ref = data.externalOrderId ? ` #${data.externalOrderId}` : "";
  const dest = data.destination === "puerto" ? "Puerto de BA" : "Aeroparque";
  return `AEROPARKING — Confirmación de reserva${ref} — ${dest}`;
}
