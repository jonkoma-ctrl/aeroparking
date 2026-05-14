# Manual de Aeroparking

> Guía operativa para el equipo. Acá está todo lo que necesitás saber para usar el panel administrativo, gestionar reservas y atender consultas de clientes.

**Última actualización**: 2026-05-14

---

## Índice

1. [Qué es Aeroparking](#1-que-es-aeroparking)
2. [Entrar al panel administrativo](#2-entrar-al-panel-administrativo)
3. [Pantalla principal: el Dashboard](#3-pantalla-principal-el-dashboard)
4. [Reservas: ver la agenda completa](#4-reservas-ver-la-agenda-completa)
5. [Detalle de una reserva: cómo gestionarla](#5-detalle-de-una-reserva-como-gestionarla)
6. [Estados de una reserva: qué significa cada uno](#6-estados-de-una-reserva-que-significa-cada-uno)
7. [Cómo se calcula el precio (estadía y media estadía)](#7-como-se-calcula-el-precio-estadia-y-media-estadia)
8. [Destinos: agregar, editar, foto, descripción](#8-destinos-agregar-editar-foto-descripcion)
9. [Tarifas: cambiar precios y descuentos](#9-tarifas-cambiar-precios-y-descuentos)
10. [Créditos a clientes (vuelo cancelado, etc.)](#10-creditos-a-clientes-vuelo-cancelado-etc)
11. [Ajustes del sitio: cambiar foto del hero y datos de contacto](#11-ajustes-del-sitio-cambiar-foto-del-hero-y-datos-de-contacto)
12. [Atender consultas de clientes](#12-atender-consultas-de-clientes)
13. [Exportar datos a Excel](#13-exportar-datos-a-excel)
14. [Atajos del día a día (cheatsheet)](#14-atajos-del-dia-a-dia-cheatsheet)
15. [Historial de novedades](#15-historial-de-novedades)
16. [Quién te ayuda si algo no anda](#16-quien-te-ayuda-si-algo-no-anda)

---

## 1. Qué es Aeroparking

Aeroparking es nuestra web pública y el sistema interno para gestionar todo el negocio:

- **El cliente** entra a [aeroparking.vercel.app](https://aeroparking.vercel.app), elige a dónde viaja (Aeroparque, Ezeiza, Cruceros), completa el formulario y recibe un email con la confirmación.
- **Nosotros** vemos todas esas reservas en el panel administrativo, las gestionamos día a día y configuramos precios, destinos y datos del sitio.

**Importante**: el pago se hace en presencia cuando el cliente deja el auto (efectivo, tarjeta o transferencia). La web no cobra plata online en este momento.

---

## 2. Entrar al panel administrativo

1. Andá a [aeroparking.vercel.app/admin/login](https://aeroparking.vercel.app/admin/login).
2. Ingresá la contraseña que te pasamos.
3. Al ingresar quedás logueado y vas directo al Dashboard.

Si te olvidaste de la contraseña, pedísela a Jon.

---

## 3. Pantalla principal: el Dashboard

**URL**: [aeroparking.vercel.app/admin/dashboard](https://aeroparking.vercel.app/admin/dashboard)

Es la pantalla que ves al entrar. Te muestra cómo va el negocio de un vistazo. Tiene cuatro partes:

### Tarjetas con números (KPIs)

Seis tarjetas grandes con los números clave:

- **Reservas en el período**: cuántas reservas hubo en el rango que estás mirando, con comparación contra el período anterior (por ejemplo, este mes vs el mes pasado).
- **Facturación**: total que se cobró.
- **Ticket promedio**: cuánto gasta en promedio cada cliente.
- **Autos en sede hoy**: cuántos autos están en este momento en Costa Salguero (con check-in hecho).
- **No-show rate**: porcentaje de clientes que reservaron y no aparecieron.
- **Cancelación rate**: porcentaje de cancelaciones sobre reservas finalizadas.

Cada tarjeta muestra una flechita verde ▲ (subió) o roja ▼ (bajó) comparando con el período anterior.

### Filtros

Arriba de las tarjetas tenés cuatro filtros:

- **Desde / Hasta**: rango de fechas.
- **Destino**: todos, Aeroparque, Ezeiza o Cruceros.
- **Estado**: filtrar por estado de las reservas (pendientes, confirmadas, etc.).

Apretás "Aplicar" y todas las tarjetas y gráficos se actualizan.

### Gráficos

- **Reservas por día**: línea con la cantidad de reservas día a día.
- **Por destino**: torta que muestra qué porcentaje de las reservas va a cada destino.

### Botón "Descargar CSV"

Te baja un Excel con todas las reservas que coinciden con los filtros. Útil para informes mensuales o cruzar con contabilidad.

---

## 4. Reservas: ver la agenda completa

**URL**: [aeroparking.vercel.app/admin/agenda](https://aeroparking.vercel.app/admin/agenda)

Es la lista completa de reservas en formato tabla. Cada fila es una reserva con:

- Fecha de ingreso y retiro
- Destino
- Cliente (nombre)
- Vehículo (patente + marca + modelo)
- Precio
- Estado

Tenés filtros arriba (destino + rango de fechas) y un botón para exportar a Excel.

Click en cualquier fila para ver el detalle completo de esa reserva.

---

## 5. Detalle de una reserva: cómo gestionarla

Cuando entrás al detalle de una reserva (haciendo click en una fila de la agenda) ves toda la información del cliente:

- **Datos personales**: nombre, email, teléfono.
- **Vehículo**: patente, marca, modelo.
- **Reserva**: fechas de ingreso y retiro, precio, cantidad de pasajeros.
- **Vuelo** (si corresponde): aerolínea y número.
- **Notas**: cualquier observación que dejó el cliente o que agregamos.

Arriba del todo está el **estado** con un botón al lado para cambiarlo (por ejemplo, marcar que el auto llegó, que se retiró o que el cliente no apareció).

### Si el cliente tiene crédito a favor

Si ese cliente ya tuvo otra reserva que se canceló y le dimos crédito, vas a ver un **banner verde** al principio diciendo *"Este cliente tiene $X de crédito a favor"*. Al cobrar, descontá ese monto y después marcá el crédito como usado desde [Créditos](#10-creditos-a-clientes-vuelo-cancelado-etc).

---

## 6. Estados de una reserva: qué significa cada uno

| Estado | Qué significa | Cuándo se usa |
|---|---|---|
| **Pendiente** | Reserva apenas creada, falta confirmar | Caso raro, casi no aparece |
| **Confirmada** | El sistema mandó el email al cliente | Al ratito de crearse |
| **En sede** | El auto está en Costa Salguero | Cuando llega el cliente y te entrega el auto |
| **Completada** | Reserva terminada, el cliente retiró el auto | Cuando se va el cliente |
| **Cancelada** | El cliente avisó que no viene | Si avisó antes de check-in, gratis. Si fue después, depende del caso |
| **No-show** | El cliente reservó y nunca apareció | Si pasaron 24h del horario y no vino |

El estado lo cambiás vos manualmente desde el detalle de cada reserva.

---

## 7. Cómo se calcula el precio (estadía y media estadía)

Esta es **la regla que aprobó el operador** y la usamos siempre:

- Una **estadía** = 24 horas. Es indivisible: si el cliente deja el auto solo 4 horas, igual cobra 1 estadía completa.
- Después de las primeras 24 horas, cada bloque de hasta 12 horas adicionales = **media estadía**.
- Dos medias se convierten automáticamente en 1 completa.

### Ejemplos prácticos

| Cuánto tiempo deja el auto | Cuánto cobra |
|---|---|
| 4 horas | 1 estadía completa |
| 13 horas | 1 estadía completa |
| 23 horas | 1 estadía completa |
| 28 horas | 1 estadía + ½ |
| 36 horas | 1 estadía + ½ |
| 37 horas | 2 estadías completas |
| 48 horas | 2 estadías completas |
| 49 horas | 2 estadías + ½ |

### Precios actuales (mayo 2026)

- **Estadía completa**: $40.000 ARS
- **Media estadía**: $20.000 ARS
- **Ezeiza** suma traslado: **$40.000 por tramo**. El cliente elige sin tramo, solo ida, o ida y vuelta.

Los precios los cambiás desde [Tarifas](#9-tarifas-cambiar-precios-y-descuentos).

---

## 8. Destinos: agregar, editar, foto, descripción

**URL**: [aeroparking.vercel.app/admin/destinos](https://aeroparking.vercel.app/admin/destinos)

Acá manejás los lugares a los que llevamos clientes (Aeroparque, Ezeiza, Cruceros). Si en el futuro abrimos un destino nuevo, lo agregás desde acá sin necesidad de pedir ayuda técnica.

### Qué tiene cada destino

- **Nombre completo**: aparece en el formulario cuando el cliente lo selecciona ("Aeroparque Jorge Newbery").
- **Nombre corto**: aparece en chips, listas y botones ("Aeroparque").
- **Ícono**: avión, barco, micro, auto o tren. Visual.
- **Color**: el color con el que se destaca el destino (azul, celeste, violeta, etc.).
- **Descripción**: texto breve que ve el cliente al elegir el destino.
- **Foto**: imagen representativa. Se ve grande cuando el cliente selecciona el destino en el formulario.
- **Activo / inactivo**: si está inactivo, no aparece en la web.

### Cómo agregar un destino nuevo

1. Click en **"+ Nuevo destino"** arriba a la derecha.
2. Poné un identificador corto (sin espacios, todo en minúsculas, ej: `cordoba`).
3. Nombre completo, nombre corto, ícono, color.
4. Subí una foto (recomendado: 16:9, máximo 5MB, formato JPG/PNG/WebP).
5. Guardar.
6. **Importante**: andá a [Tarifas](#9-tarifas-cambiar-precios-y-descuentos) y creá la tarifa para ese destino. Sin tarifa, el destino no se puede cotizar.

### Cómo cambiar la foto de un destino

1. En la tabla, click en **"Editar"** al lado del destino.
2. En el bloque "Foto del destino", click en **"Cambiar"** (si ya hay foto) o **"Subir imagen"** (si no hay).
3. Elegí el archivo y subilo.
4. Guardar.

### Cómo desactivar temporalmente un destino

Click en el botón "Activo" (verde) de la tabla → pasa a "Inactivo" (gris). El destino deja de aparecer en la web. Para reactivarlo, click de nuevo.

---

## 9. Tarifas: cambiar precios y descuentos

**URL**: [aeroparking.vercel.app/admin/tarifas](https://aeroparking.vercel.app/admin/tarifas)

Acá cambiás los precios. Cada fila es una combinación destino + tipo de servicio.

### Cambiar un precio rápido

1. Click directamente en el precio (aparece subrayado).
2. Escribí el nuevo valor.
3. Click en **OK**.

Las reservas que ya estaban tomadas mantienen el precio que tenían cuando se hicieron — solo las nuevas usan el precio actualizado.

### Configuración avanzada

Click en **"⚙ Avanzado"** al final de la fila. Te abre un panel con:

- **Mínimo y máximo de días**: por ejemplo, si querés que un servicio solo se pueda reservar entre 2 y 30 días.
- **Descuentos por duración**: agregá descuentos automáticos. Por ejemplo: "Desde 7 días → 10% off". Si el cliente reserva 10 días, el sistema aplica el 10% solo. Si reserva 3 días, no aplica nada.
- **Traslado**:
  - **Incluido**: para Aeroparque y Cruceros (no se cobra extra).
  - **No incluido**: para Ezeiza. Tenés que configurar el "costo por tramo" (ej: $40.000) y el cliente elige cuántos tramos en el formulario.

Click en **"Guardar cambios"** al final del panel para que tome efecto.

### Activar / desactivar una tarifa

Click en el badge "Activa" → pasa a "Inactiva". Si la dejás inactiva, el destino no se puede reservar.

---

## 10. Créditos a clientes (vuelo cancelado, etc.)

**URL**: [aeroparking.vercel.app/admin/creditos](https://aeroparking.vercel.app/admin/creditos)

Sirve para casos donde el cliente paga, pero le cancelan el vuelo o pasa algo y queremos darle crédito para una próxima reserva en vez de devolver plata.

### Cómo crear un crédito

1. Click en **"+ Nuevo crédito"** arriba a la derecha.
2. Email del cliente (el mismo con el que reservó).
3. Monto en pesos.
4. **Motivo** (opcional pero recomendado): explicación corta, ej: *"Vuelo AA1234 cancelado el 14/05. Quedó 3hs y se llevó el auto."*
5. **Reserva origen** (opcional): el código de la reserva donde se generó el crédito.
6. Crear.

El crédito queda **disponible** y atado al email del cliente.

### Cómo aplicar un crédito

1. Cuando el cliente vuelve a reservar con el mismo email, al entrar al detalle de su nueva reserva vas a ver un **banner verde** que dice *"Este cliente tiene $X de crédito a favor"*.
2. Al cobrarle en presencia, descontá ese monto del total.
3. Volvé a la pantalla de Créditos.
4. Buscá el crédito por email (filtro arriba).
5. Click en **"Marcar usado"**.

El crédito queda registrado como **usado** con la fecha y deja de aparecer disponible.

### Ver créditos de un cliente específico

Escribí el email en el filtro **"Filtrar por email"** y apretá **Filtrar**.

### Vencimiento de créditos

Los créditos **no vencen automáticamente**. Si querés cerrar uno por antigüedad, click en **"Expirar"** desde la tabla.

---

## 11. Ajustes del sitio: cambiar foto del hero y datos de contacto

**URL**: [aeroparking.vercel.app/admin/settings](https://aeroparking.vercel.app/admin/settings)

Acá editás cosas globales del sitio que ve el cliente.

### Hero de la home

Es la imagen y el título grande que aparece arriba de todo en la página principal.

- **Imagen principal**: subí la foto que querés que aparezca de fondo. Recomendado: horizontal, buena calidad, máximo 5MB.
- **Alt text**: descripción para personas con lectores de pantalla (accesibilidad). Algo simple como "Estacionamiento Costa Salguero".
- **Título**: el texto grande. Si lo dejás vacío, usa el texto por defecto. Si querés cambiarlo, escribí el nuevo.
- **Subtítulo**: el texto debajo del título. Misma lógica.

### Datos de contacto

- **WhatsApp**: número en formato internacional sin el `+`. Ejemplo: `5491131606994`. Aparece en los botones de WhatsApp del sitio y en los emails.
- **Email de contacto**: aparece en el footer y al final de los emails.

Click en **"Guardar cambios"**. Los cambios se ven en la web en 1-2 segundos.

---

## 12. Atender consultas de clientes

### El cliente quiere cambiar fecha o cancelar

Mandalo a **[aeroparking.vercel.app/mi-reserva](https://aeroparking.vercel.app/mi-reserva)** con su código de reserva (que está en el email de confirmación). Desde ahí puede:

- Ver los datos de su reserva.
- Cancelar si todavía no entró el auto a la sede (cancelar antes de check-in = gratis).
- Extender la estadía (si tenemos disponibilidad).

Si el cambio es complicado o el auto ya está adentro, hacelo manualmente desde [Agenda](#4-reservas-ver-la-agenda-completa).

### El cliente dice que no recibió el email

1. Verificá la reserva en [Agenda](#4-reservas-ver-la-agenda-completa) — confirmá que el email cargado es correcto.
2. Pedile que revise spam.
3. Si igual no llegó, podés reenviar manualmente desde el detalle de la reserva (funcionalidad pendiente — por ahora avisale a Jon).

### El cliente con vuelo cancelado

1. Confirmá la reserva: código + monto pagado.
2. Andá a [Créditos](#10-creditos-a-clientes-vuelo-cancelado-etc) → "+ Nuevo crédito".
3. Cargá email + monto + motivo.
4. Avisale al cliente: *"Te queda un crédito de $X a tu nombre. Cuando reserves de nuevo te lo descontamos del total."*

### El cliente quiere reservar de último momento (menos de 24h)

Por defecto el sistema bloquea reservas con menos de 24h de anticipación. En esos casos pasale el WhatsApp del 11 3160 6994 o creale la reserva manualmente vos.

---

## 13. Exportar datos a Excel

Tenés botones de **"Descargar CSV"** en dos lugares:

- En el [Dashboard](#3-pantalla-principal-el-dashboard) — exporta con los filtros aplicados (rango fechas + destino + estado).
- En [Agenda](#4-reservas-ver-la-agenda-completa) — exporta con los filtros aplicados.

El archivo que te baja se abre directo en Excel o Google Sheets. Tiene todas las columnas: cliente, email, teléfono, patente, marca, modelo, fechas, precio, estado, etc.

**Tip**: si querés un informe mensual de facturación, setá las fechas del mes en el Dashboard y descargá. Después en Excel sumás la columna "Precio".

---

## 14. Atajos del día a día (cheatsheet)

| Quiero... | Hago |
|---|---|
| Ver cuántas reservas hay esta semana | [Dashboard](#3-pantalla-principal-el-dashboard) → filtrar fechas |
| Ver la lista completa de reservas | [Agenda](#4-reservas-ver-la-agenda-completa) |
| Marcar que un auto llegó | [Agenda](#4-reservas-ver-la-agenda-completa) → click en la reserva → cambiar estado |
| Subir una foto del Hero de la web | [Ajustes](#11-ajustes-del-sitio-cambiar-foto-del-hero-y-datos-de-contacto) |
| Cambiar foto de un destino | [Destinos](#8-destinos-agregar-editar-foto-descripcion) → editar → cambiar imagen |
| Subir el precio | [Tarifas](#9-tarifas-cambiar-precios-y-descuentos) → click en el precio |
| Configurar descuento por estadía larga | [Tarifas](#9-tarifas-cambiar-precios-y-descuentos) → Avanzado |
| Dar crédito a un cliente | [Créditos](#10-creditos-a-clientes-vuelo-cancelado-etc) → "+ Nuevo crédito" |
| Aplicar un crédito existente | Cobrar menos al cliente + [Créditos](#10-creditos-a-clientes-vuelo-cancelado-etc) → Marcar usado |
| Exportar a Excel | [Dashboard](#3-pantalla-principal-el-dashboard) o [Agenda](#4-reservas-ver-la-agenda-completa) → Descargar CSV |
| Agregar un destino nuevo | [Destinos](#8-destinos-agregar-editar-foto-descripcion) → "+ Nuevo destino" → después crear tarifa |
| Cambiar el WhatsApp de contacto | [Ajustes](#11-ajustes-del-sitio-cambiar-foto-del-hero-y-datos-de-contacto) |

---

## 15. Historial de novedades

### 14 de mayo de 2026 — Ajustes de la home

- 🛬 El cotizador rápido de la home ahora muestra los **3 destinos** (antes solo aparecían Aeroparque y Cruceros, faltaba Ezeiza).
- 📞 El botón de WhatsApp en el Hero pasa a ser un link de **consulta** ("¿Dudas? Consultanos por WhatsApp"), claramente diferenciado del botón principal "Reservar ahora". Antes parecía otra forma de reservar.
- ✏️ Cambiado el texto "Mercado Pago" → "Pagás al dejar el auto" en el cotizador (refleja la realidad: pago presencial).
- 🔘 Bloque CTA del final de la home: el botón secundario decía "Reservar Puerto de BA" (genérico solo para un destino). Ahora dice **"Reservar ahora"** (botón principal) y **"Ver servicios y precios"** (secundario). El "Reservar ahora" lleva al form unificado donde el cliente elige su destino.

### 14 de mayo de 2026

- ✨ Manual interno disponible en `/admin/manual`.
- 🎨 Diseño nuevo del sitio: paleta azul corporativa, tipografía nueva, Hero rediseñado.
- 📊 **Nuevo Dashboard** con tarjetas de KPIs, gráficos y filtros.
- 📸 **Fotos por destino**: cada destino ahora tiene una foto que el cliente ve al elegirlo. Editás desde Destinos.
- ⚙️ **Pantalla de Ajustes**: cambiá la foto del Hero y los datos de contacto sin pedir ayuda.
- 📧 Email de confirmación ahora muestra la foto del destino arriba.

### Días previos

- Sistema de **créditos a clientes** para casos de vuelo cancelado.
- Modelo de **estadía y media estadía** para cobrar correctamente.
- **Ezeiza** como destino con cargo de traslado configurable.
- Formulario unificado en `/reservar` con selector de destino.
- 4 emails automáticos al cliente: confirmación, recordatorio 24h, bienvenida post-check-in, pedido de reseña.

---

## 16. Quién te ayuda si algo no anda

- **Cualquier duda operativa o algo no funciona**: Jon ([jonkoma@gmail.com](mailto:jonkoma@gmail.com) / WhatsApp).
- **Cambios que querés sumar al sistema** (nuevas pantallas, integraciones): anotalos y mandáselos a Jon.

Este manual se actualiza cada vez que se hace un cambio importante. Si ves algo que no encaja con la realidad (un botón que cambió de lugar, una pantalla nueva que no está documentada), avisanos.
