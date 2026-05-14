# Manual interno — Aeroparking

> **Última actualización**: 2026-05-14
> **Público**: personal interno (Jon + equipo Costa Salguero + atención al cliente).
> **URL del manual** (no listada): `/admin/manual` (requiere login admin).

Este documento explica cómo funciona la plataforma de adentro hacia afuera, qué hace cada pantalla del admin y qué pasos seguir para las operaciones más comunes.

---

## 1. Visión general

Aeroparking es la web pública + sistema interno para gestionar reservas de estacionamiento con traslado a:

- **Aeroparque Jorge Newbery** (4 km)
- **Aeropuerto de Ezeiza** (40 km — con cargo de traslado adicional)
- **Terminal de Cruceros** (Puerto de Buenos Aires)
- **Valet para eventos** (cotización custom)

El cliente entra a la web, elige destino, completa el formulario, recibe email de confirmación. El día de la reserva paga en presencia al dejar el auto (efectivo, tarjeta o transferencia).

**No hay cobro online en MVP** — Mercado Pago está dormido pero conectado por si en el futuro se activa la opción de seña.

---

## 2. URLs principales

| URL | Audiencia | Qué hace |
|---|---|---|
| `https://aeroparking.vercel.app/` | Público | Landing principal con Hero + selector de destinos. |
| `https://aeroparking.vercel.app/reservar` | Público | Form de reserva unificado. Acepta `?destino=aeroparque\|ezeiza\|puerto`. |
| `https://aeroparking.vercel.app/valet-eventos` | Público | Form de cotización para Valet Parking. |
| `https://aeroparking.vercel.app/mi-reserva` | Cliente | Self-service: ver, cancelar, extender una reserva existente. |
| `https://aeroparking.vercel.app/admin/login` | Interno | Login del admin (solo password). |
| `https://aeroparking.vercel.app/admin/dashboard` | Interno | KPIs + gráficos + filtros + export. Pantalla por defecto al loguearse. |
| `https://aeroparking.vercel.app/admin/agenda` | Interno | Lista completa de reservas con filtros + tabla. |
| `https://aeroparking.vercel.app/admin/destinos` | Interno | Configurar destinos (foto, label, ícono, color, descripción). |
| `https://aeroparking.vercel.app/admin/tarifas` | Interno | Editar precios por estadía, descuentos por duración, traslado pago. |
| `https://aeroparking.vercel.app/admin/creditos` | Interno | Créditos a clientes (cancelaciones por vuelo cancelado, etc.). |
| `https://aeroparking.vercel.app/admin/settings` | Interno | Hero image, título, contacto WhatsApp + email. |
| `https://aeroparking.vercel.app/admin/manual` | Interno (no listada) | Este manual. |

---

## 3. Modelo de pricing — Estadía y ½ estadía

Regla del operador (validada):

- **1 estadía = 24 horas** indivisibles. Mínimo se cobra siempre 1 estadía aunque el auto deje 4 horas.
- Después de las primeras 24h, cada bloque adicional de hasta 12h = **½ estadía**.
- 2 medias se consolidan en 1 completa.

**Casos validados**:

| Tiempo | Cobro |
|---|---|
| 4 h | 1 estadía |
| 13 h | 1 estadía |
| 23 h | 1 estadía |
| 28 h | 1 estadía + ½ |
| 36 h | 1 estadía + ½ |
| 37 h | 2 estadías |
| 48 h | 2 estadías |
| 49 h | 2 estadías + ½ |

**Precios actuales** (mayo 2026):

- Estadía completa: **$40.000 ARS**
- Media estadía: **$20.000 ARS**

**Ezeiza** suma traslado: **$40.000 ARS por tramo** (sin tramo / solo ida / ida y vuelta). El cliente elige en el formulario.

Los precios se editan desde `/admin/tarifas`. El helper `calculateStays()` está en `src/lib/pricing.ts`.

---

## 4. Estados de una reserva

| Status | Significado | Quién lo setea |
|---|---|---|
| `pending` | Reserva creada, sin confirmar (caso raro). | Automático al crear. |
| `confirmed` | Confirmada por el sistema. Cliente tiene email. | Automático cuando el form valida. |
| `checked_in` | Auto en sede. | Manual desde admin. |
| `completed` | Auto retirado, viaje terminado. | Manual desde admin. |
| `cancelled` | Cancelada (antes de check-in = gratis). | Manual desde admin o cliente vía `/mi-reserva`. |
| `no_show` | Cliente no apareció. | Manual desde admin. |

Estos estados afectan los KPIs del dashboard (no-show rate, autos en sede hoy, etc.).

---

## 5. Cómo opera el dashboard `/admin/dashboard`

### KPI cards (6 tarjetas)

- **Reservas en el período**: cantidad total con los filtros aplicados. Delta vs período anterior equivalente.
- **Facturación**: suma del campo `price` de las reservas. Delta %.
- **Ticket promedio**: facturación / reservas. Delta %.
- **Autos en sede hoy**: reservas con `status=checked_in` cuya fecha de retiro es futura.
- **No-show rate**: `no_show / (completed + no_show + cancelled)`. % sobre reservas finalizadas.
- **Cancel rate**: `cancelled / finalizadas`. % sobre reservas finalizadas.

### Filtros

- **Desde / Hasta**: rango de fechas (filtra por `startDate` de la reserva).
- **Destino**: todos, aeroparque, ezeiza, puerto.
- **Estado**: cualquiera de los 6 status.

Los filtros se guardan en la URL — si copiás el link y se lo pasás a otra persona, ve los mismos números.

### Gráficos

- **Reservas por día**: line chart, eje X = fecha, eje Y = cantidad de reservas.
- **Por destino**: pie/donut chart con cantidad y % por destino.

### Exportar

Botón "**Descargar CSV**" al lado de los filtros. Te devuelve un Excel-compatible con todas las reservas filtradas (cliente, vehículo, fechas, precio, status, etc.). Las columnas están listadas en `/api/admin/export`.

---

## 6. Administrar destinos `/admin/destinos`

Cada destino tiene:

- **Slug** (URL — no se puede cambiar después de creado): `aeroparque`, `ezeiza`, `puerto`, etc.
- **Nombre completo**: "Aeroparque Jorge Newbery" — aparece en la card hero del formulario.
- **Nombre corto**: "Aeroparque" — aparece en chips y badges.
- **Ícono**: plane, ship, bus, car, train (selector).
- **Color de acento**: blue, sky, violet, amber, emerald, rose, indigo.
- **Descripción**: copy público debajo del nombre.
- **Instructivo de llegada**: texto largo que se muestra al cliente en el email confirmación. ⚠️ **Funcionalidad parcial** — campo en DB pero todavía no se renderiza en el email (usa instructivo hardcoded global).
- **Imagen**: foto representativa (16:9 recomendado, JPG/PNG/WebP < 5MB). Se guarda en Vercel Blob.
- **Texto alternativo**: alt text de la imagen (accesibilidad).
- **Orden**: número entero, menor = aparece primero.
- **Activo**: si está apagado, no aparece en la home ni en el form.

### Agregar un destino nuevo

1. `/admin/destinos` → "+ Nuevo destino".
2. Completar slug + nombre + ícono + color.
3. Subir foto (opcional pero recomendado).
4. Guardar.
5. Ir a `/admin/tarifas` y crear la tarifa correspondiente (sin esto, el destino no se puede cotizar).

### Reordenar destinos

Editar el destino → cambiar campo "Orden" → guardar. Menor valor = aparece primero. Default = 100.

---

## 7. Administrar tarifas `/admin/tarifas`

Cada fila es una combinación **destino + tipo de servicio**. Por ejemplo:

- aeroparque + larga_estadia
- ezeiza + ezeiza_larga_estadia
- puerto + cruceros

### Campos básicos

- **Precio/día** (mal-llamado, es por estadía completa): pesos ARS, entero.
- **Descripción**: ayuda interna.
- **Estado**: activa / inactiva.

### Configuración avanzada (click ⚙ Avanzado)

- **Precio de referencia**: si está prendido, redirige a un checkout externo (caso legacy AA2000). Ignoralo, no se usa en el flow nuevo.
- **Mín / máx días**: límites opcionales.
- **Descuentos por duración**: array `{fromDays, pctOff}`. Ejemplo: desde 7 días → 10% off, desde 14 días → 15% off. El sistema aplica el descuento más alto que califique.
- **Traslado incluido**: checkbox. Si está prendido, no hay cargo adicional. Si está apagado, podés configurar:
- **Costo por tramo**: $X por cada tramo (ida o vuelta). El cliente elige cuántos tramos en el formulario.

### Cambiar precios

Click en el precio → editar → ✓. Se actualiza al instante. Las reservas viejas no se recalculan (mantienen el precio que tenían).

---

## 8. Créditos a clientes `/admin/creditos`

Sirve para casos donde el cliente paga, vuelo se cancela y queremos darle crédito para un viaje futuro en vez de devolver plata.

### Flujo

1. Cliente cancela por vuelo cancelado → no se le devuelve plata, se le promete crédito.
2. Admin entra a `/admin/creditos` → "+ Nuevo crédito".
3. Email del cliente + monto en pesos + motivo (ej: "Vuelo AA1234 cancelado 14/05") + (opcional) ID reserva origen.
4. Estado por defecto: `available`.
5. Cuando el cliente vuelve a reservar, **en la pantalla de detalle de su reserva nueva** aparece un **banner verde** indicando "Tiene $X de crédito a favor".
6. Al cobrar en presencia, el admin descuenta ese monto del total.
7. Volver a `/admin/creditos` → "Marcar usado".

### Estados de un crédito

- **available**: disponible para aplicar.
- **used**: ya se aplicó (con fecha + reserva opcional).
- **expired**: vencido (manual — no expira solo).

### Buscar créditos por cliente

Campo "Filtrar por email" → enter. Lista solo los del cliente.

---

## 9. Configuración del sitio `/admin/settings`

Edita campos globales sin tocar código:

- **Imagen del Hero**: foto principal de la home (16:9, JPG/PNG/WebP).
- **Alt text**: descripción para accesibilidad.
- **Título del Hero**: si está vacío, usa el default ("Estacioná seguro. Viajá sin preocupaciones.").
- **Subtítulo del Hero**: si está vacío, usa el default.
- **WhatsApp**: número internacional sin `+` (ej: `5491131606994`). Lo usan los CTAs de WhatsApp y los emails.
- **Email de contacto**: aparece en footer y emails.

Guardar → cambios visibles en 1-2 segundos en la home.

---

## 10. Agenda `/admin/agenda` y detalle de reserva

### Vista de lista

- Tabla con todas las reservas (Aeroparque + Puerto + Cruceros).
- Filtros: destino (todos / aeroparque / puerto), rango de fechas.
- Export CSV (mismo que dashboard).
- Click en una fila → detalle.

### Detalle `/admin/agenda/[id]`

- Datos del cliente, vehículo, reserva.
- Vuelos (si aplica).
- Estado: cambiar con el botón al lado del badge.
- **Si el cliente tiene crédito**: banner verde con el monto disponible + link a `/admin/creditos`.
- Notas internas.

---

## 11. Cron de mails

Vercel Cron Jobs corre `/api/cron/daily-emails` diariamente. Manda:

- **Recordatorio 24h antes** del ingreso.
- **Mail de bienvenida** después del check-in.
- **Pedido de reseña** después del check-out.

⚠️ **Whitelist activo en producción**: para evitar mandar mails a clientes reales mientras testeamos. Solo se mandan mails a:
- `jonkoma@gmail.com`
- `reservas@nrauditores.com.ar`
- `jon@masmetros.com.ar`

Para desactivar el whitelist y abrir mails a todos los clientes:
1. `src/lib/email.ts` → buscar `TEST_EMAILS` → comentar o vaciar el array.
2. PR + merge + redeploy.

---

## 12. Flujo de soporte al cliente

### Cliente quiere cambiar fecha / cancelar

1. Decirle que entre a `https://aeroparking.vercel.app/mi-reserva?id=...` o `?order=...`.
2. Allí puede cancelar gratis si todavía no entró el auto (antes del check-in).
3. Si ya está adentro o el cambio es complicado, hacerlo manual desde `/admin/agenda/[id]`.

### Cliente reporta no haber recibido el email

1. Verificar si su email está en el whitelist (si está activo) — solo mails de prueba se envían.
2. Si el whitelist está desactivado, revisar logs en Vercel → función `/api/reservas/presencial`.
3. Reenviar manualmente desde el detalle de la reserva (feature pendiente).

### Cliente con vuelo cancelado

1. Confirmar el case (ID reserva + monto pagado).
2. Crear crédito en `/admin/creditos` con su email + monto.
3. Avisarle que tiene crédito disponible para próxima reserva.

---

## 13. Stack técnico (referencia rápida)

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + recharts.
- **Tipografía**: Outfit (display) + Inter (body) vía `next/font`.
- **DB**: PostgreSQL en Neon (gestión vía Prisma).
- **Imágenes**: Vercel Blob (token `BLOB_READ_WRITE_TOKEN`).
- **Mail**: Nodemailer + Gmail SMTP (`GMAIL_USER` + `GMAIL_APP_PASSWORD`).
- **Deploy**: Vercel auto-deploy en push a `main`.
- **Cron**: Vercel Cron Jobs (configurado en `vercel.json`).
- **Auth admin**: middleware con cookie + env var `ADMIN_PASSWORD`.

### Env vars producción (Vercel)

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL. |
| `ADMIN_PASSWORD` | Password de `/admin/login`. |
| `GMAIL_USER` + `GMAIL_APP_PASSWORD` | Envío de emails. |
| `BLOB_READ_WRITE_TOKEN` | Upload de imágenes a Vercel Blob. |
| `NEXT_PUBLIC_SITE_URL` | URL canónica para links en emails. |
| `NEXT_PUBLIC_BRAND_NAME` | "AEROPARKING". |
| `MP_ACCESS_TOKEN` | (Dormido) Mercado Pago — sin uso en MVP. |
| `AEROPARQUE_MAIL_TOKEN` | (Legacy) Webhook AA2000 — sin uso en MVP. |

---

## 14. Operaciones recurrentes (cheatsheet)

### Cargar un destino nuevo
1. `/admin/destinos` → "+ Nuevo destino"
2. `/admin/tarifas` → crear tarifa para ese destino

### Cambiar el precio base
1. `/admin/tarifas` → click en el precio → editar → ✓

### Subir foto al Hero de la home
1. `/admin/settings` → bloque "Hero de la home" → subir imagen → Guardar

### Aplicar un crédito a un cliente
1. `/admin/creditos` → "+ Nuevo crédito" → email + monto + motivo → Crear
2. Cuando el cliente vuelve a reservar, ver banner en el detalle de la reserva

### Marcar auto como en sede
1. `/admin/agenda/[id]` → botón al lado del estado → "checked_in"

### Exportar listado a Excel
1. `/admin/dashboard` o `/admin/agenda` → aplicar filtros → "Descargar CSV"

### Ver KPIs del mes
1. `/admin/dashboard` → setear desde/hasta = primer día y último día del mes → Aplicar

---

## 15. Historial de cambios

> Esta sección se actualiza con cada deploy.

### 2026-05-14 — Fotos + Dashboard + Rediseño + Manual
- ✅ Fotos por destino (Vercel Blob).
- ✅ Dashboard `/admin/dashboard` con KPIs, gráficos, filtros y export.
- ✅ Rediseño paleta + tipografía (Outfit + Inter) + Hero rediseñado.
- ✅ SiteSettings: Hero + contacto editables desde admin.
- ✅ Email confirmación muestra foto del destino.
- ✅ Manual interno en `/admin/manual` (este documento).

### 2026-05-14 — Destinos dinámicos + form único
- ✅ Modelo `Destination` en DB, admin `/admin/destinos` para gestionar.
- ✅ `/reservar?destino=X` página única con picker.
- ✅ Forms viejos `/reservar/{aeroparque,ezeiza,puerto,cruceros}` redirigen al unificado.

### 2026-05-14 — Pricing por estadía + créditos
- ✅ Función `calculateStays()` con regla del operador (1 + ½).
- ✅ Modelo `CustomerCredit` + admin `/admin/creditos`.
- ✅ Campos `transferIncluded` + `transferCostPerLeg` en tarifas.
- ✅ Banner crédito en detalle de reserva.
- ✅ Script seed-tariffs.ts con $40k base.

### 2026-05-02 — Form presencial + cleanup AA2000 (PR #9)
- ✅ Form multi-step en `/reservar/{aeroparque,ezeiza,puerto}` (pago presencial).
- ✅ 4 templates de email (confirmación, recordatorio, bienvenida, reseña).
- ✅ Cron diario `/api/cron/daily-emails`.
- ✅ Limpieza de la integración AA2000 (webhook, parser).
- ✅ Whitelist de emails para testing.

### 2026-05-01 — Ezeiza + identidad (PR #8)
- ✅ Destino Ezeiza agregado.
- ✅ Limpieza visual AA2000 (logo, header, footer).

---

## 16. Preguntas / soporte

Cualquier duda operativa o bug → Jon (jonkoma@gmail.com / WhatsApp).
Cualquier cambio del sistema → registrarlo en la sección 15 de este documento.

**Para actualizar este manual**: editar `MANUAL.md` en la raíz del repo (`C:\Users\jordy\parking-aeroparque\MANUAL.md`) → commit → push → se actualiza automáticamente en `/admin/manual` después del deploy de Vercel.
