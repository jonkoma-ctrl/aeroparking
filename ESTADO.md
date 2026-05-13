# Aeroparking — Estado del Proyecto

**Última actualización:** 2026-04-17
**URL producción:** https://aeroparking.vercel.app
**Repo:** https://github.com/jonkoma-ctrl/aeroparking
**Deploy:** Vercel (auto-deploy desde `main`)

---

## 🎯 Qué hace el sistema

Plataforma de reservas y gestión de estacionamiento con traslado para:
- **Aeroparque Jorge Newbery** (Valet Parking + Larga Estadía)
- **Puerto de Buenos Aires** (Larga Estadía Cruceros)

Combina:
- Checkout externo (AA2000) para servicios oficiales de Aeroparque
- Checkout propio con **Mercado Pago** para Larga Estadía Cruceros
- Ingesta automática de reservas AA2000 desde emails de WooCommerce
- Panel admin con agenda unificada, tarifas configurables y export CSV
- Widget de cotización instantánea (único en el mercado BA)

---

## 🏗️ Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| DB | PostgreSQL (Neon) via Prisma ORM |
| Payments | Mercado Pago Checkout Pro |
| Email | Nodemailer + Gmail SMTP (App Password) |
| Email ingestion | Google Apps Script (trigger c/5min) |
| Auth admin | Middleware + cookie (clave única) |
| Deploy | Vercel (auto en push a main) |

---

## 🌐 URLs públicas

### Landing + reservas (cliente)
- **Home:** https://aeroparking.vercel.app
- **Widget cotización:** embebido en home (debajo del Hero)
- **Reservar Cruceros (MP):** https://aeroparking.vercel.app/reservar/cruceros
- **Reservar Puerto (MP):** https://aeroparking.vercel.app/reservar/puerto
- **Mi Reserva (lookup):** https://aeroparking.vercel.app/mi-reserva
- **Páginas de servicios:**
  - https://aeroparking.vercel.app/servicios/valet-parking
  - https://aeroparking.vercel.app/servicios/larga-estadia
  - https://aeroparking.vercel.app/servicios/terminal-cruceros

### Admin (clave: `aeroparking2026`)
- **Agenda unificada:** https://aeroparking.vercel.app/admin/agenda
- **Reservas Cruceros:** https://aeroparking.vercel.app/admin/reservas
- **Tarifas:** https://aeroparking.vercel.app/admin/tarifas
- **Login:** https://aeroparking.vercel.app/admin/login

### API pública
- `GET /api/pricing/quote` — cotización + recomendación de servicio
- `GET /api/aeroparque` — listado reservas Aeroparque (público read-only)
- `GET /api/mi-reserva?order=XXXX` — lookup cliente
- `POST /api/mi-reserva/cancel` — solicitud de cancelación
- `POST /api/mi-reserva/extend` — solicitud de extensión
- `GET /api/mi-reserva/quote` — cotización de extensión

### API de pagos
- `POST /api/payments/create` — crea preference MP (Puerto Larga Estadía)
- `POST /api/payments/cruise` — crea preference MP (Cruceros)
- `POST /api/payments/webhook` — IPN de Mercado Pago

### API admin
- `GET /api/admin/pricing` — listar tarifas
- `POST /api/admin/pricing` — crear/actualizar tarifa
- `PATCH /api/admin/pricing` — editar tarifa (con descuentos por duración)
- `GET /api/admin/export` — export CSV de agenda (con filtros)

### API integración email
- `POST /api/integraciones/aeroparque/email` — webhook AA2000 (Bearer auth)

---

## 💼 Flujos principales

### 1. Reserva Aeroparque (externa AA2000)
1. Cliente reserva en tienda.aeropuertosargentina.com
2. WooCommerce envía email a `reservas@nrauditores.com.ar`
3. Apps Script (cada 5 min) busca emails no procesados
4. POST al webhook `/api/integraciones/aeroparque/email` con token Bearer
5. Parser extrae datos → crea `AeroparqueReservation` con `status: "confirmed"`
6. Email labeleado `aeroparque-procesado` para no reprocesar

### 2. Reserva Cruceros (MP propio)
1. Cliente completa form en `/reservar/cruceros`
2. Backend calcula precio × días con tarifa admin
3. Crea `CruiseReservation` con `status: "pending_payment"`
4. Crea preference MP → redirige a Mercado Pago
5. Cliente paga en MP
6. MP webhook recibe IPN → confirma reserva + envía email (si pasa whitelist)
7. Cliente vuelve a `/reservar/cruceros/resultado`

### 3. Reserva Puerto Larga Estadía (MP propio)
Mismo flujo que Cruceros pero usa `AeroparqueReservation` con `destination: "puerto"`.

### 4. Widget cotización (home + páginas de servicios)
1. Cliente elige destino + fechas → "Calcular tarifa"
2. Backend consulta `/api/pricing/quote`:
   - Si `serviceType` provisto → devuelve quote exacto
   - Si no → ejecuta `recommendCheapestService` → devuelve recomendado + alternativas
3. Muestra desglose: precio/día, días, descuentos por duración, total
4. CTA dinámico:
   - Aeroparque (referencia) → abre AA2000 en nueva pestaña
   - Puerto/Cruceros → redirige a `/reservar/puerto|cruceros?prefill=XXX`

### 5. Admin
- **Agenda** unificada con filtros (destino, fecha) + export CSV
- **Detalle** de cada reserva (click en nombre del cliente)
- **Tarifas** con:
  - Precio/día (editable inline)
  - Modo avanzado: min/max días, descuentos escalonados, checkout externo
  - Activar/desactivar tarifa
- **Confirmar/Cancelar/Completar** reservas con botones de acción

### 6. Cliente - Self service (`/mi-reserva`)
- Buscar reserva por número de pedido
- Ver detalles completos (cliente, vehículo, fechas, vuelos, precio)
- Solicitar cancelación (con motivo)
- Solicitar extensión de estadía (solo Puerto, con cálculo de costo extra)
- Auto-cargar desde link `?order=XXX` (usado en emails)

---

## 🗃️ Modelos de datos

### `AeroparqueReservation`
Reservas que vienen de AA2000 (email webhook) + reservas Puerto con MP.

Campos clave: `externalOrderId` (único), `destination`, `serviceType`, `customerName`, `email`, `licensePlate`, `carBrand`, `carModel`, `startDate`, `endDate`, `price`, `status`, `departureAirline`, `arrivalFlight`, `arrivalTime`, `checkInTime`, `passengers`, `notes`, `rawEmailBody`.

### `CruiseReservation`
Reservas del formulario web de cruceros con MP.

Campos clave: `firstName`, `lastName`, `email`, `phone`, `departureDate`, `arrivalTime`, `returnDate`, `pickupTime`, `passengers`, `licensePlate`, `carBrand`, `carModel`, `cruiseLine`, `terminal`, `notes`, `status`.

### `ServicePricing`
Tarifas configurables por servicio.

Campos: `destination`, `serviceType`, `pricePerDay`, `isReference` (true = referencia AA2000), `externalCheckoutUrl`, `minDays`, `maxDays`, `durationDiscounts` (JSON array), `active`.

Unique: `[destination, serviceType]`.

### Estados posibles (status)
- `pending` — Pendiente de confirmación
- `pending_payment` — Esperando pago MP
- `confirmed` — Confirmada
- `cancelled` — Cancelada
- `cancellation_requested` — Cliente solicitó cancelar
- `extension_requested` — Cliente solicitó extender
- `payment_rejected` — MP rechazó pago
- `completed` — Reserva completada

---

## 🔐 Env vars en Vercel

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL |
| `ADMIN_PASSWORD` | Clave para entrar a `/admin/*` |
| `AEROPARQUE_MAIL_TOKEN` | Bearer token para webhook de emails |
| `GMAIL_USER` | Email desde donde se envían confirmaciones |
| `GMAIL_APP_PASSWORD` | App password de Gmail (no password normal) |
| `MP_ACCESS_TOKEN` | Mercado Pago access token de producción |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio para callbacks |
| `NEXT_PUBLIC_VALET_URL` | URL externa AA2000 valet |
| `NEXT_PUBLIC_LONG_STAY_URL` | URL externa AA2000 larga estadía |
| `NEXT_PUBLIC_BRAND_NAME` | AEROPARKING |

---

## ⚠️ Modo test / whitelist de emails

**ACTIVO**: solo se envían emails a:
- `jonkoma@gmail.com`
- `reservas@nrauditores.com.ar`
- `jon@masmetros.com.ar`

Cualquier otro email se saltea con log. **Al pasar a producción**, editar `src/lib/email.ts` y comentar/eliminar el check de whitelist.

---

## 📦 Tarifas actuales (admin)

| Destino | Servicio | Precio/día | Tipo |
|---|---|---|---|
| Aeroparque | Drop & Go | $67.000 | Referencia AA2000 (checkout externo) |
| Aeroparque | Larga Estadía | $9.285 | Referencia AA2000 (externo, 4-14 días) |
| Puerto | Larga Estadía | $36.250 | Real (checkout MP propio) |
| Puerto | Cruceros | $36.250 | Real (checkout MP propio) |

Editables en `/admin/tarifas` con botón **⚙ Avanzado**:
- Mínimo/máximo de días
- Descuentos escalonados por duración (ej: 7+ días = 10% off)
- URL de checkout externo (para tarifas de referencia)

---

## 🚀 Features implementadas

### Cliente
- [x] Landing con Hero + Service Selector + FAQ
- [x] Widget cotización instantánea en home
- [x] Widget compact en páginas de servicios
- [x] Formulario Cruceros con MP (naviera, terminal, pasajeros)
- [x] Formulario Puerto Larga Estadía con MP
- [x] Checkout Pro Mercado Pago
- [x] Página de resultado post-pago
- [x] Self-service `/mi-reserva` con lookup por código
- [x] Cancelación de reserva con motivo
- [x] Extensión de reserva con cálculo automático de costo extra
- [x] Auto-prefill desde link del email

### Admin
- [x] Auth por clave (cookie 30 días)
- [x] Sidebar unificada (Agenda, Cruceros, Tarifas)
- [x] Agenda unificada con filtros (destino + fechas)
- [x] Export CSV con filtros aplicados
- [x] Detalle de reserva clickeable
- [x] Botones confirmar/cancelar/completar
- [x] CRUD tarifas con descuentos escalonados

### Integraciones
- [x] Webhook emails AA2000 idempotente
- [x] Parser multi-formato (plain text, Gmail bold)
- [x] Detección de duplicados (no re-envía email si ya existe)
- [x] Apps Script con trigger automático cada 5 min
- [x] Mercado Pago Checkout Pro + IPN webhook
- [x] Email confirmación con template HTML branded
- [x] Instructivo por servicio (Costa Salguero con Google Maps)
- [x] Whitelist de emails de test

### Analytics
- [x] Events en `window.dataLayer`:
  - `quote_started`
  - `quote_calculated`
  - `service_recommended`
  - `quote_cta_clicked`
  - `redirected_external_checkout`
  - `internal_checkout_started`
- [x] Funnel ID en sessionStorage

---

## 🔜 Pendientes / ideas futuras

- [ ] **Remover whitelist de emails** al pasar a producción
- [ ] Reviews + contador público "+2.000 viajeros" en landing
- [ ] Mensaje WhatsApp automático post-reserva (para refuerzo)
- [ ] Dashboard admin con KPIs (ingresos, ocupación, top clientes)
- [ ] Buscador de clientes en admin con historial
- [ ] Config admin: clave, whitelist, env vars editables
- [ ] Notificación push/email al admin cuando llega nueva reserva
- [ ] Sistema de cupones/descuentos
- [ ] Dominio propio (hoy: aeroparking.vercel.app)
- [ ] GA4 / Google Ads conversion tracking conectado a dataLayer
- [ ] Cancelación con reembolso automático MP
- [ ] Integración billing Contabilium (si aplica)
- [ ] Mobile app o PWA

---

## 📁 Estructura de archivos clave

```
parking-aeroparque/
├── prisma/schema.prisma              # DB models
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home
│   │   ├── admin/                    # Panel admin (middleware-protected)
│   │   │   ├── layout.tsx            # Sidebar
│   │   │   ├── agenda/
│   │   │   ├── reservas/
│   │   │   ├── tarifas/
│   │   │   └── login/
│   │   ├── api/
│   │   │   ├── pricing/quote/        # API cotización pública
│   │   │   ├── admin/pricing/        # CRUD tarifas
│   │   │   ├── admin/export/         # CSV export
│   │   │   ├── payments/create/      # MP preference Puerto
│   │   │   ├── payments/cruise/      # MP preference Cruceros
│   │   │   ├── payments/webhook/     # MP IPN
│   │   │   ├── integraciones/aeroparque/email/  # Webhook AA2000
│   │   │   ├── mi-reserva/           # Self-service
│   │   │   └── reservas/             # CruiseReservation CRUD
│   │   ├── reservar/
│   │   │   ├── cruceros/             # Form cruceros + resultado
│   │   │   └── puerto/               # Form puerto + resultado
│   │   ├── mi-reserva/               # Lookup cliente
│   │   └── servicios/                # Páginas informativas (c/widget)
│   ├── components/
│   │   ├── booking-widget/           # Widget cotización reusable
│   │   ├── booking/CruiseBookingForm.tsx
│   │   ├── landing/                  # Hero, FAQ, etc.
│   │   └── layout/                   # Header (dropdown), Footer
│   ├── lib/
│   │   ├── pricing.ts                # Lógica pura cotización
│   │   ├── email.ts                  # Nodemailer wrapper (con whitelist)
│   │   ├── email-templates.ts        # Template HTML
│   │   ├── analytics.ts              # DataLayer events
│   │   ├── booking-prefill.ts        # Encode/decode URL prefill
│   │   └── ...
│   ├── middleware.ts                 # Auth admin
│   └── ...
├── scripts/gmail-webhook.gs          # Apps Script para trigger cada 5 min
└── ...
```

---

## 🛠️ Desarrollo local

```bash
cd C:\Users\jordy\parking-aeroparque
npm install
# Setear .env con credenciales (NO commitear)
npx prisma generate
npx prisma db push
npm run dev  # localhost:3000
```

**Importante:** dev local apunta a la DB de producción (Neon). Cuidado con cambios destructivos.

---

## 🔗 Info adicional

- Git remote (push directo): `origin-jk` → https://github.com/jonkoma-ctrl/aeroparking
- Cuenta Gmail del Apps Script: `reservas@nrauditores.com.ar`
- Admin MP: https://www.mercadopago.com.ar/developers/panel/app
- Dashboard Vercel: https://vercel.com/jonkoma-ctrls-projects/aeroparking
- Neon DB: console.neon.tech (credenciales en Vercel env vars)
