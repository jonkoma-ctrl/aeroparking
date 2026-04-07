# AEROPARKING — Parking y Traslados | Aeroparque & Cruceros

Landing comercial para servicios de parking y traslados vinculados a Aeroparque Jorge Newbery y Terminal de Cruceros de Buenos Aires.

## Servicios

1. **Drop & Go / Valet Parking Aeroparque** — integración externa
2. **Larga Estadía Aeroparque** — integración externa
3. **Terminal de Cruceros** — flujo de reserva propio

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Prisma + PostgreSQL (Neon)
- Lucide Icons

## Requisitos

- Node.js 18+
- npm o pnpm

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma + crear base de datos
npx prisma generate
npx prisma db push

# 3. Iniciar servidor de desarrollo
npm run dev
```

O en un solo comando:

```bash
npm run setup && npm run dev
```

El sitio estará disponible en `http://localhost:3000`

## Variables de entorno

Copiar `.env.local` y ajustar si es necesario:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_VALET_URL` | URL del servicio de Valet Parking (AA2000) |
| `NEXT_PUBLIC_LONG_STAY_URL` | URL del servicio de Larga Estadía (AA2000) |
| `DATABASE_URL` | Connection string de la base de datos |
| `NEXT_PUBLIC_BRAND_NAME` | Nombre comercial del sitio |
| `ADMIN_EMAIL` | Email para notificaciones admin |

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing principal |
| `/servicios/valet-parking` | Detalle + CTA externo |
| `/servicios/larga-estadia` | Detalle + CTA externo |
| `/servicios/terminal-cruceros` | Detalle del servicio |
| `/reservar/cruceros` | Formulario de reserva |
| `/reservar/cruceros/confirmacion?id=X` | Confirmación |
| `/admin/reservas` | Panel interno de reservas |

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/reservas` | Crear reserva de crucero |
| `GET` | `/api/reservas` | Listar reservas (admin) |
| `GET` | `/api/reservas/:id` | Obtener reserva |
| `PATCH` | `/api/reservas/:id` | Actualizar estado |

## Fase 2 — Mejoras futuras

- [ ] Autenticación para panel admin
- [ ] Notificaciones por email (Resend / Nodemailer)
- [ ] Payment gateway
- [ ] Migración a PostgreSQL / Supabase
- [ ] Analytics y tracking de conversión
- [ ] WhatsApp integration para confirmaciones
- [ ] Testing E2E
- [ ] CI/CD
