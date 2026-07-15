# CLAUDE.md

Project-specific instructions for Claude Code sessions working on Aeroparking.

---

## Mantener actualizado el manual interno

Al final de cualquier PR que modifique funcionalidad visible para el usuario interno (admin) o el cliente final, **actualizar `MANUAL.md`** en la raíz del repo.

El manual se renderiza en `/admin/manual` (URL no listada). Cualquier sección que cambie debe quedar reflejada antes de mergear.

### Reglas de redacción

El manual está dirigido a **usuarios sin conocimiento técnico** (Jon + personal Costa Salguero + atención al cliente). No es documentación de developer.

- **NO usar**: jerga técnica como "Prisma", "schema", "DB", "API", "endpoint", "env var", "PR", "deploy", "repo", "MD", "markdown", "build", "Vercel Blob", "Next.js", "middleware", "cookie", "JSON", "regex", "fetch", "request", "JWT", etc.
- **SÍ usar**: lenguaje conversacional, "click acá", "andá a esta pantalla", "tarjeta verde", "botón Guardar". Como explicarle el sistema a un amigo no programador.
- **Links a secciones**: usar markdown anchors hacia los IDs slugificados (ej: `[Tarifas](#9-tarifas-cambiar-precios-y-descuentos)`).
- **Links a URLs**: usar markdown links absolutos (ej: `[aeroparking.vercel.app/admin/dashboard](https://aeroparking.vercel.app/admin/dashboard)`).
- **Tablas operativas** y **cheatsheet** > prosa larga.

### Qué actualizar

1. **Sección 15 — Historial de novedades**: agregar entrada con fecha + bullets breves en lenguaje no-técnico (ej: "✨ Nueva pantalla de Ajustes para cambiar foto del Hero").
2. **Si se agrega una pantalla de admin**: agregarla en el índice (sección 1), agregarle una sección propia con la URL clickeable y explicación paso a paso.
3. **Si cambia un flujo operativo**: actualizar el cheatsheet (sección 14).
4. **Si cambian precios, estados o reglas de negocio**: actualizar las secciones 6, 7 y 9.
5. **NO documentar cambios internos** que el usuario no ve (refactors, libs, env vars, schema changes).

No esperar a que el usuario lo pida — es parte del Definition of Done de cada cambio funcional.

---

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL (Neon)
- Vercel deploy
- Vercel Blob para imágenes
- Outfit + Inter via next/font

## Estructura clave

- `src/lib/destinos.ts` — helpers Destination (server-side)
- `src/lib/site-settings.ts` — singleton SiteSettings
- `src/lib/pricing.ts` — `calculateStays()` y `calculateQuote()`
- `src/lib/dashboard-stats.ts` — agregaciones del dashboard
- `src/components/booking/PresentialBookingForm.tsx` — form de reserva (acepta `destinationMeta` dinámica)
- `src/components/booking/ReservarPicker.tsx` — picker + hero card del destino
- `prisma/schema.prisma` — fuente de verdad de los modelos

## Reglas de trabajo

- **Build verify antes de PR**: `npx next build` debe pasar limpio (no solo TypeScript — también prerender de páginas estáticas).
- **No agregar páginas estáticas que lean de DB sin `export const dynamic = "force-dynamic"`** — Vercel intenta prerender y falla si la tabla no existe (ej: al cambiar schema).
- **Mantener el whitelist de emails** (`TEST_EMAILS` en `src/lib/email.ts`) hasta que el cliente apruebe explícitamente abrir mails a todos los clientes.
- **Schema changes**: el `build` del `package.json` corre `prisma db push --accept-data-loss` — aplica el schema en cada deploy. ⚠️ La flag `--accept-data-loss` hace que Prisma ejecute cambios destructivos (dropear columnas/tablas) SIN pedir confirmación. Agregar columnas nuevas es seguro (el warning de unique constraint en columna nueva es falso positivo). Pero si un cambio de schema ELIMINA o renombra una columna con datos, revisar a mano antes de mergear (correr `npx prisma db push` local apuntando a prod y leer el warning) — sino se pierden datos en el deploy.
- **Imágenes externas**: cualquier dominio nuevo de imágenes debe agregarse a `next.config.mjs > images.remotePatterns`.
