# CLAUDE.md

Project-specific instructions for Claude Code sessions working on Aeroparking.

---

## Mantener actualizado el manual interno

Al final de cualquier PR que modifique funcionalidad visible para el usuario interno (admin) o el cliente final, **actualizar `MANUAL.md`** en la raíz del repo.

El manual se renderiza en `/admin/manual` (URL no listada). Cualquier sección que cambie debe quedar reflejada antes de mergear.

Específicamente:

1. **Sección 15 — Historial de cambios**: agregar entrada con fecha + bullets breves de qué entró.
2. **Si se agrega una pantalla de admin**: actualizar la tabla de URLs (sección 2) y agregar una sección explicativa propia.
3. **Si cambia un flujo operativo**: actualizar el "cheatsheet" de la sección 14.
4. **Si cambian env vars**: actualizar la tabla de la sección 13.
5. **Si cambian status, precios o reglas de negocio**: actualizar las secciones 3, 4 y 7.

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
- **Schema changes**: agregar al script de build `prisma db push` ya está en el `build` del `package.json`, así que el deploy aplica el schema automáticamente.
- **Imágenes externas**: cualquier dominio nuevo de imágenes debe agregarse a `next.config.mjs > images.remotePatterns`.
