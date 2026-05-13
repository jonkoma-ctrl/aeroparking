# BookingWidget — Design notes (basado en research de competencia)

## Sitios analizados (abril 2026)

| Sitio | Mercado | Patrón clave |
|---|---|---|
| **ParkSleepFly** (USA) | Aeropuertos + hotel | Stack vertical con radio cards, trust icons inline |
| **Holiday Extras** (UK) | Aeropuertos UK | "Never beaten on price" + Trustpilot Excellent · comparativa Park&Ride / Stroll / Meet&Greet |
| **SpotHero** (USA) | Stacionamiento urbano + aeropuertos | Toggle Hourly/Daily/Monthly, "4.8 App Store · 100M+ cars parked" |
| **Looking4Parking** (BA) | Agregador global | Feefo 4.7/5 (9.139 reviews), "Save up to 60%" hook, security badges |
| **Parkos** (UE) | Aeropuertos europeos | "7M safety checks", "Best price guaranteed", "Free changes 24h" |

## Hallazgos clave

1. **Nadie cobra por horas exactas como nosotros** → debemos comunicar muy claro "1 estadía = 24h"
2. **Layout horizontal en hero** (Booking.com pattern) gana sobre vertical en desktop
3. **Sticky mobile bar** con precio + CTA visible siempre (65% tráfico es móvil, convierte 0.7% vs 2.4% desktop)
4. **Price breakdown panel** SIEMPRE visible → +22% conversión (caso Holiday Extras)
5. **Trust band**: rating + badges juntos sube confianza (Looking4 muestra Feefo + Trustwave + Thawte)
6. **Smart defaults reducen fricción** → pre-llenar hora típica (10:00 ingreso, 10:00 retiro)
7. **Comparativa de opciones en results** → cards lado a lado con "Mejor opción" pin
8. **Free cancellation 24h** = trust commodity, debe estar visible
9. **Microcopy benefit-driven** → "Bajo techo · Vigilancia 24/7 · Mercado Pago"
10. **Pricing transparency early** → mostrar total con traslado ANTES del checkout

## Patrones a evitar

- Stack vertical largo en desktop (≥5 campos visibles) → da "ansiedad de formulario"
- Esconder el precio hasta hacer click → friction
- CTA genérico "Buscar" → mejor "Calcular tarifa" / "Reservar"
- Time pickers nativos sin defaults → usuario abandona
- Dark patterns: countdown timers falsos, scarcity inventada

---

## Design tokens para Aeroparking

### Colores
- **Primary**: `brand-900` (#111827) — botones principales, headers
- **Accent**: `accent-500` (#f59e0b yellow gold) — pricing destacado, badges premium
- **Success**: `green-600` — ahorros, traslado incluido, OK
- **Warning soft**: `amber-50/200/700` — destino Ezeiza (mensaje "+traslado")
- **Surface elevated**: `bg-white` con `shadow-2xl` color-tinted brand
- **Surface ambient**: `bg-gradient-to-br from-brand-50 to-white` para el card de precio

### Typography
- Headers: font-extrabold, tracking-tight
- Pricing: text-3xl/4xl extrabold, color brand-900
- Microcopy: text-xs text-brand-500
- Discount badge: text-xs font-bold

### Spacing
- Card padding: `p-6 md:p-8` (hero) / `p-5` (compact)
- Form gap: `gap-4`
- Result breakdown gap: `space-y-1`

### Componentes específicos a implementar

#### A) `<DestinoPills>` — 3 pills horizontales
```
[ ✈ Aeroparque ] [ 🚢 Cruceros ] [ ✈ Ezeiza ]
```
- Activo: `bg-white text-brand-900 shadow-sm`
- Inactivo: `text-brand-500 hover:text-brand-700`
- Contenedor: `bg-brand-100 rounded-xl p-1`

#### B) `<DateTimeField>` — date + time inline
```
[ 📅 dd/mm/yyyy  ] [ 10:00 ]
```
- Default time: 10:00 ingreso, 10:00 retiro (24h limpio)
- Time input con `step="1800"` (30min)
- Mismo input para mobile/desktop

#### C) `<TransferOptions>` — solo Ezeiza
```
🚗 Traslado a Ezeiza ($40.000/tramo)
[ Sin traslado ] [ Solo ida ] [ Ida y vuelta ✓ ]
```
- Card amber subtle (`bg-amber-50 border-amber-200`)
- Pills con estado activo amber

#### D) `<TrustBand>` — fila de microcopy
```
✓ Bajo techo  ⚡ Reserva 30s  💳 Mercado Pago  ↻ Cancelación 24h gratis
```
- Posición: bottom del form + bottom del result
- Estilo: `text-xs text-brand-500 flex flex-wrap gap-3 justify-center`

#### E) `<PriceCard>` — el héroe del result
```
┌─────────────────────────────────────┐
│  $60.000                            │
│  1 estadía + ½ · $40.000/estadía    │
│  ───────────────────────────────    │
│  Cochera (1 estadía + ½)  $60.000   │
│  Traslado × 2 tramos      $80.000   │
│  ───────────────────────────────    │
│  Total                   $140.000   │
└─────────────────────────────────────┘
```
- Container: `bg-gradient-to-br from-brand-50 to-white border-brand-100`
- Si discount: `originalTotal` tachado arriba

#### F) `<ComparisonRow>` — alternativas
```
También disponible:
[ Drop & Go Aeroparque · 1 estadía · $40.000 ]
```
- Cards clickeables que swap el quote actual
- Si la alternativa es más cara que la recomendada: chip "+$X"
- Si más barata pero requiere acción: chip "Más barato"

#### G) `<StickyMobileBar>` — solo en mobile, después del result
```
┌─────────────────────────────────────┐
│ $60.000 · 1 estadía + ½             │
│       [ Continuar al pago → ]       │
└─────────────────────────────────────┘
```
- `fixed bottom-0 inset-x-0 bg-white border-t shadow-xl p-4 md:hidden`
- Visible solo en phase = "result"

---

## Mejoras al widget actual (BookingWidget.tsx)

### Cambios visuales
1. ✅ Agregar **3era pill Ezeiza** (no las 2 actuales)
2. ✅ Reemplazar `<input type="date">` solo por **date + time** lado a lado, time con default
3. ✅ Si destino = Ezeiza → mostrar `<TransferOptions>` con pills (default Ida y vuelta)
4. ✅ En result: agregar **breakdown panel** abajo del precio principal
5. ✅ En mobile: **sticky bar bottom** con precio + CTA cuando phase=result
6. ✅ Cambiar `días` por `estadías` con plural correcto y soporte de ½
7. ✅ Trust band actualizada: "Bajo techo · Reserva 30s · Mercado Pago · Cancelación 24h gratis"

### Cambios de microcopy
- Heading: "Cotizá tu reserva al instante" → mantener
- Botón calcular: "Calcular tarifa" → "Ver mi tarifa" (más conversacional)
- En result: "Tarifa recomendada" → "Tu mejor opción"
- CTA Aeroparque: "Reservar en Aeropuertos Argentina" → "Reservar en AA2000 ↗"
- CTA interno: "Continuar con la reserva" → "Continuar al pago →"
- Tooltip explicativo (i): "1 estadía = 24 horas. Pasadas 24h, cada 12h adicionales = ½ estadía"

### Validaciones nuevas
- Si retiroTime sin retiroDate → error
- Si ingreso < ahora + 1h → "Reservá con al menos 1h de anticipación"
- Min duración: 1 hora (mínimo 1 estadía igual)
- Max: 60 días

### Smart defaults
- Hora ingreso: 10:00
- Hora retiro: 10:00 (1 estadía exacta si misma fecha+1)
- Destino: aeroparque (es el más demandado)
- Transfer Ezeiza: 2 (ida y vuelta por default)

---

## Implementación recomendada (orden)

1. Refactor `BookingWidget.tsx` con todos los cambios visuales y de copy
2. Implementar sticky mobile bar como componente separado
3. Tooltip explicativo del modelo de estadías (info icon)
4. Smart defaults
5. Testing móvil real (Chrome DevTools mobile + dispositivo)
6. A/B microcopy en producción una vez sale (medir con events analytics ya existentes)

## Sources

- [Top 15 UX Tips for Travel Booking Conversion](https://ulansoftware.com/blog/ux-tips-improve-travel-booking-conversion)
- [Holiday Extras Airport Parking](https://www.holidayextras.com/airport-parking.html)
- [SpotHero homepage UX](https://spothero.com/)
- [ParkSleepFly widget structure](https://www.parksleepfly.com/)
- [Looking4Parking Argentina](https://www.looking4.com/ar/aparcamiento-en-el-aeropuerto/buenos-aires-aeroparque-j-newbery-aep)
- [UX Case Study: Automating Airport Parking](https://medium.com/glow-team/ui-ux-case-study-automation-of-parking-lots-at-airports-f428a2ee56b0)
- [Parkos value props](https://www.parkos.com/es/)
