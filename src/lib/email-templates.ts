import { formatDate, formatPrice, getServiceTypeLabel } from "./utils";
import { getSiteUrl } from "./site-url";

// ─── Configuración compartida ────────────────────────────────────────────────

const SITE_URL = getSiteUrl();
const MAPS_COSTA_SALGUERO = "https://maps.app.goo.gl/kZQH9UpSa5zGYxY5A";
const WA_PHONE = "5491131606994";
const WA_DISPLAY = "11 3160 6994";
const ADMIN_MAIL = "reservas@nrauditores.com.ar";

// La URL real de review se carga dinámicamente desde SiteSettings (admin /settings).
// Para usarla en templates, pasala via la prop `reviewUrl` o usá buildReviewRequestEmail(data, reviewUrl).

// ─── Tipos compartidos ──────────────────────────────────────────────────────

function destinationHeroImage(imageUrl: string | null | undefined, alt: string): string {
  if (!imageUrl) return "";
  return `
    <div style="margin-bottom:24px;border-radius:12px;overflow:hidden">
      <img src="${imageUrl}" alt="${alt}" style="display:block;width:100%;height:auto;max-height:240px;object-fit:cover" />
    </div>
  `;
}

export interface ReservationEmailData {
  customerName: string;
  externalOrderId?: string;
  reservationId?: string;
  destination: string; // "aeroparque" | "ezeiza" | "puerto"
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
  destinationImageUrl?: string | null;
  destinationImageAlt?: string | null;
  qrToken?: string | null;
}

/** Bloque QR para el email de confirmación (código de acceso a la sede). */
function qrBlock(qrToken: string | null | undefined): string {
  if (!qrToken) return "";
  const qrImg = `${SITE_URL}/api/qr/${qrToken}`;
  return `
    <div style="margin-top:24px;border:2px solid #1e3a8a;border-radius:12px;padding:20px;text-align:center;background:#f8fafc">
      <p style="margin:0 0 4px;color:#1e3a8a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Tu código de ingreso</p>
      <p style="margin:0 0 14px;color:#64748b;font-size:13px">Mostralo al llegar a Costa Salguero para registrar tu ingreso.</p>
      <img src="${qrImg}" alt="Código QR de la reserva" width="200" height="200" style="display:block;margin:0 auto;width:200px;height:200px" />
      <p style="margin:14px 0 0;color:#0f172a;font-size:22px;font-weight:800;letter-spacing:4px;font-family:monospace">${qrToken}</p>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:12px">Si el escáner no lee el QR, dictá este código.</p>
    </div>
  `;
}

// ─── Helpers de markup ───────────────────────────────────────────────────────

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 12px;color:#6b7280;border-bottom:1px solid #f3f4f6">${label}</td><td style="padding:8px 12px;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6;text-align:right">${value}</td></tr>`;
}

function destinoLabel(destination: string): string {
  if (destination === "puerto") return "Terminal de Cruceros — Puerto de Buenos Aires";
  if (destination === "ezeiza") return "Aeropuerto de Ezeiza";
  return "Aeroparque Jorge Newbery";
}

function destinoShort(destination: string): string {
  if (destination === "puerto") return "Cruceros";
  if (destination === "ezeiza") return "Ezeiza";
  return "Aeroparque";
}

/// Layout común: header + body + footer con datos de contacto.
/// `bodyHtml` es la sección variable de cada template.
function wrapInLayout(bodyHtml: string, opts: { showContactBlock?: boolean } = {}) {
  const { showContactBlock = true } = opts;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:20px">

    <!-- Header -->
    <div style="background:#0f172a;border-radius:12px 12px 0 0;padding:24px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:1px;font-weight:800">
        AERO<span style="color:#60a5fa">PARKING</span>
      </h1>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:13px">
        Estacionamiento &middot; Traslados &middot; Aeroparque · Ezeiza · Cruceros
      </p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
      ${bodyHtml}

      ${
        showContactBlock
          ? `
      <!-- Contact -->
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;text-align:center">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px">¿Necesitás ayuda? Atención las 24 horas.</p>
        <p style="margin:0;color:#374151;font-size:14px">
          <a href="https://wa.me/${WA_PHONE}" style="color:#0f172a;font-weight:600;text-decoration:none">
            WhatsApp ${WA_DISPLAY}
          </a>
        </p>
        <p style="margin:4px 0 0;color:#6b7280;font-size:13px">
          <a href="mailto:${ADMIN_MAIL}" style="color:#6b7280;text-decoration:none">${ADMIN_MAIL}</a>
        </p>
      </div>
      `
          : ""
      }
    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6;border-radius:0 0 12px 12px;padding:16px;text-align:center;border:1px solid #e5e7eb;border-top:0">
      <p style="margin:0;color:#9ca3af;font-size:12px">
        © 2026 AEROPARKING — Costa Salguero, CABA
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/// Tabla con los datos de la reserva (compartida entre templates).
function reservationTable(data: ReservationEmailData): string {
  const orderRef = data.externalOrderId
    ? `Pedido #${data.externalOrderId}`
    : `Reserva ${data.reservationId?.slice(0, 8) || ""}`;
  const isCruceros = data.serviceType === "cruceros";
  const startStr = formatDate(data.startDate);
  const endStr = formatDate(data.endDate);

  let rows = "";
  rows += row("Referencia", orderRef);
  rows += row("Servicio", getServiceTypeLabel(data.serviceType));
  rows += row("Destino", destinoLabel(data.destination));
  rows += row(
    isCruceros ? "Embarque" : "Ingreso",
    `${startStr}${data.checkInTime ? ` — ${data.checkInTime} hs` : ""}`
  );
  rows += row(
    isCruceros ? "Desembarque" : "Retiro",
    `${endStr}${data.arrivalTime ? ` — ${data.arrivalTime} hs` : ""}`
  );
  rows += row("Vehículo", `${data.licensePlate} — ${data.carBrand} ${data.carModel}`);

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
    rows += row("Total estimado", formatPrice(data.price));
  }

  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>`;
}

/// Bloque destacado con código de reserva visible.
function reservationCodeBlock(data: ReservationEmailData): string {
  const code = data.externalOrderId || data.reservationId?.slice(0, 8) || "";
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Tu código de reserva</p>
      <p style="margin:0;color:#0f172a;font-size:28px;font-weight:800;letter-spacing:3px">${code}</p>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:12px">Mostralo al llegar a Costa Salguero</p>
    </div>
  `;
}

/// Bloque con el instructivo de "qué hacer al llegar".
function arrivalInstructions(): string {
  return `
    <!-- Dirección destacada -->
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-top:24px">
      <h3 style="margin:0 0 12px;color:#1d4ed8;font-size:16px">📍 Dónde dejás y retirás el vehículo</h3>
      <p style="margin:0 0 6px;color:#0f172a;font-size:17px;font-weight:700;line-height:1.4">
        Av. Costanera Rafael Obligado s/n
      </p>
      <p style="margin:0 0 14px;color:#0f172a;font-size:15px;line-height:1.4">
        Costa Salguero · CABA
      </p>
      <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.6">
        Al llegar te recibe nuestro personal, registra el vehículo, te cobra y te traslada al destino en nuestras unidades. Al regresar, te buscamos en la terminal y volvés a casa con tu auto.
      </p>
      <a href="${MAPS_COSTA_SALGUERO}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
        📌 Ver ubicación en Google Maps
      </a>
    </div>

    <!-- Cambios y cancelaciones — bloque dedicado -->
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-top:16px">
      <h3 style="margin:0 0 8px;color:#92400e;font-size:16px">📞 ¿Necesitás cambiar o cancelar?</h3>
      <p style="margin:0 0 12px;color:#451a03;font-size:14px;line-height:1.6">
        Escribinos por WhatsApp al <strong>${WA_DISPLAY}</strong>. Atención las 24 horas. También podés gestionar tu reserva con el botón de abajo.
      </p>
      <a href="https://wa.me/${WA_PHONE}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-right:6px">
        💬 Abrir WhatsApp
      </a>
    </div>

    <!-- Recordatorios prácticos -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-top:16px">
      <p style="margin:0 0 8px;color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Tené en cuenta</p>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
        <li>Pago al dejar el vehículo: efectivo, tarjeta o transferencia</li>
        <li>Cancelación gratis antes de entregar el vehículo</li>
        <li>Si tu vuelo se retrasa, avisanos por WhatsApp al aterrizar</li>
      </ul>
    </div>
  `;
}

function manageReservationCta(data: ReservationEmailData): string {
  const lookupParam = data.externalOrderId
    ? `order=${data.externalOrderId}`
    : `id=${data.reservationId}`;
  return `
    <div style="text-align:center;margin-top:32px">
      <a href="${SITE_URL}/mi-reserva?${lookupParam}" style="display:inline-block;background:#0f172a;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600">
        Gestionar mi reserva
      </a>
    </div>
  `;
}

// ─── Template 1: Confirmación de reserva ─────────────────────────────────────

export function buildReservationEmail(data: ReservationEmailData): string {
  const heroImg = destinationHeroImage(
    data.destinationImageUrl,
    data.destinationImageAlt || destinoLabel(data.destination)
  );
  const body = `
    ${heroImg}
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">¡Hola ${data.customerName}!</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
      Tu reserva en <strong>${destinoShort(data.destination)}</strong> fue recibida.
      Acá están los detalles para que los tengas a mano.
    </p>
    ${reservationCodeBlock(data)}
    ${reservationTable(data)}
    ${qrBlock(data.qrToken)}
    ${arrivalInstructions()}
    ${manageReservationCta(data)}
  `;
  return wrapInLayout(body);
}

export function getReservationEmailSubject(data: { customerName: string; destination: string; externalOrderId?: string }) {
  const ref = data.externalOrderId ? ` #${data.externalOrderId}` : "";
  return `AEROPARKING — Reserva confirmada${ref} — ${destinoShort(data.destination)}`;
}

// ─── Template 2: Recordatorio 24hs antes ─────────────────────────────────────

export function buildReminderEmail(data: ReservationEmailData): string {
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">Tu viaje es mañana, ${data.customerName} 👋</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
      Te dejamos un recordatorio de tu reserva. Esperamos verte mañana en Costa Salguero.
    </p>
    ${reservationCodeBlock(data)}
    ${reservationTable(data)}

    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-top:24px">
      <h3 style="margin:0 0 12px;color:#92400e;font-size:16px">⏰ Antes de salir</h3>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
        <li>Llegá con al menos 30 minutos de anticipación al traslado</li>
        <li>Llevá tu DNI y los datos del vuelo a mano</li>
        <li>El pago se realiza al dejar el vehículo</li>
        <li>Si tenés algún cambio, avisanos por WhatsApp al ${WA_DISPLAY}</li>
      </ul>
    </div>

    ${arrivalInstructions()}
    ${manageReservationCta(data)}
  `;
  return wrapInLayout(body);
}

export function getReminderEmailSubject(data: { customerName: string; destination: string }) {
  return `AEROPARKING — Recordatorio: tu viaje a ${destinoShort(data.destination)} es mañana`;
}

// ─── Template 3: Bienvenida post-retiro ──────────────────────────────────────

export function buildWelcomeBackEmail(data: ReservationEmailData): string {
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">Bienvenido de vuelta, ${data.customerName} 🎉</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
      Esperamos que hayas tenido un excelente viaje. Gracias por confiar en nosotros para cuidar tu vehículo.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="margin:0;color:#166534;font-size:15px;line-height:1.6">
        ✅ Tu reserva <strong>${data.externalOrderId || data.reservationId?.slice(0, 8) || ""}</strong> quedó cerrada correctamente.
      </p>
    </div>

    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">
      <strong>¿Tenés un próximo viaje?</strong> Reservá con anticipación así te garantizamos el lugar:
    </p>
    <div style="text-align:center;margin:16px 0 24px">
      <a href="${SITE_URL}/" style="display:inline-block;background:#0f172a;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600">
        Reservar de nuevo
      </a>
    </div>
  `;
  return wrapInLayout(body);
}

export function getWelcomeBackEmailSubject(data: { customerName: string }) {
  return `AEROPARKING — Bienvenido de vuelta, ${data.customerName}`;
}

// ─── Template 4: Pedido de reseña ────────────────────────────────────────────

export function buildReviewRequestEmail(data: ReservationEmailData, reviewUrl?: string | null): string {
  const url = reviewUrl || `${SITE_URL}/`;
  const ctaLabel = reviewUrl ? "Dejar reseña" : "Visitar el sitio";
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">Hola ${data.customerName}, ¿cómo estuvo todo?</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
      Tu opinión nos ayuda a mejorar y a que más viajeros confíen en nosotros. Si tenés un minuto, contanos cómo fue tu experiencia.
    </p>

    <div style="text-align:center;margin:24px 0">
      <p style="margin:0 0 16px;color:#0f172a;font-size:18px;font-weight:600">
        ⭐ ⭐ ⭐ ⭐ ⭐
      </p>
      <a href="${url}" style="display:inline-block;background:#fbbf24;color:#0f172a;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:700">
        ${ctaLabel}
      </a>
    </div>

    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;text-align:center">
      Si algo no estuvo a la altura, contanos directamente respondiendo este mail.
      Vamos a hacer todo lo posible para mejorar.
    </p>
  `;
  return wrapInLayout(body);
}

export function getReviewRequestEmailSubject(data: { customerName: string }) {
  return `AEROPARKING — ${data.customerName}, ¿nos dejás tu opinión?`;
}

// ─── Template 5: Aviso al admin (interno) ────────────────────────────────────

export interface AdminNotificationData extends ReservationEmailData {
  customerEmail: string;
  customerPhone?: string | null;
  channel?: string;
  notes?: string | null;
}

export function buildAdminNotificationEmail(data: AdminNotificationData): string {
  const code = data.externalOrderId || data.reservationId?.slice(0, 8) || "";
  const startStr = formatDate(data.startDate);
  const endStr = formatDate(data.endDate);
  const adminUrl = data.reservationId
    ? `${SITE_URL}/admin/agenda/${data.reservationId}`
    : `${SITE_URL}/admin/agenda`;

  const body = `
    <div style="background:#0f172a;border-radius:8px;padding:8px 14px;margin-bottom:20px;display:inline-block">
      <p style="margin:0;color:#fbbf24;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px">🔒 Notificación interna — Uso del equipo</p>
    </div>
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">Nueva reserva 📥</h2>
    <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6">
      Entró una reserva por la web. El cliente recibió su propio email de confirmación
      con la dirección, el instructivo de llegada y el contacto para cambios.
    </p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px">
      <p style="margin:0;color:#0f172a;font-size:24px;font-weight:800;letter-spacing:2px">${code}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
      ${row("Cliente", data.customerName)}
      ${row("Email", data.customerEmail)}
      ${data.customerPhone ? row("Teléfono", data.customerPhone) : ""}
      ${row("Destino", destinoLabel(data.destination))}
      ${row("Servicio", getServiceTypeLabel(data.serviceType))}
      ${row("Ingreso", `${startStr}${data.checkInTime ? ` — ${data.checkInTime} hs` : ""}`)}
      ${row("Retiro", `${endStr}${data.arrivalTime ? ` — ${data.arrivalTime} hs` : ""}`)}
      ${row("Vehículo", `${data.licensePlate} — ${data.carBrand} ${data.carModel}`)}
      ${data.passengers ? row("Pasajeros", String(data.passengers)) : ""}
      ${data.departureAirline || data.departureFlight ? row("Vuelo salida", [data.departureAirline, data.departureFlight].filter(Boolean).join(" ")) : ""}
      ${data.arrivalAirline || data.arrivalFlight ? row("Vuelo arribo", [data.arrivalAirline, data.arrivalFlight].filter(Boolean).join(" ")) : ""}
      ${data.price ? row("Total estimado", formatPrice(data.price)) : ""}
      ${data.channel ? row("Canal", data.channel) : ""}
    </table>

    ${
      data.notes
        ? `
      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:24px">
        <p style="margin:0 0 4px;color:#92400e;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Observaciones del cliente</p>
        <p style="margin:0;color:#451a03;font-size:14px;line-height:1.5">${data.notes}</p>
      </div>
    `
        : ""
    }

    <div style="text-align:center">
      <a href="${adminUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600">
        Ver en panel admin
      </a>
    </div>
  `;
  return wrapInLayout(body, { showContactBlock: false });
}

export function getAdminNotificationSubject(data: { customerName: string; destination: string; externalOrderId?: string; reservationId?: string }) {
  const code = data.externalOrderId || data.reservationId?.slice(0, 8) || "";
  return `[Reserva nueva] ${destinoShort(data.destination)} — ${data.customerName} (${code})`;
}
