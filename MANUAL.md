# Manual de Aeroparking

> Guía operativa para el equipo. Acá está todo lo que necesitás saber para usar el panel administrativo, gestionar reservas y atender consultas de clientes.

**Última actualización**: 2026-05-14

---

## Novedad destacada — Código QR y Vista del día

Ahora cada reserva genera un **código QR** que le llega al cliente por email. El personal de BA Ferial (ex Costa Salguero) puede:

- **Escanear el QR** (📷 Escáner en el menú) con el celular para registrar el ingreso del auto y el retiro, sin buscar la reserva a mano. Si la cámara no lee, se puede tipear el código corto de 6 letras.
- Abrir la **Vista del día** (🗓️ en el menú) a la mañana para ver todos los autos que ingresan (o retiran) ese día, ordenados por hora. Se puede **imprimir** para tener la lista en papel.

Ver secciones 17 (Escáner) y 18 (Vista del día) para el detalle.

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
- **Autos en sede hoy**: cuántos autos están en este momento en BA Ferial (ex Costa Salguero) (con check-in hecho).
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
| **En sede** | El auto está en BA Ferial (ex Costa Salguero) | Cuando llega el cliente y te entrega el auto |
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
- **Alt text**: descripción para personas con lectores de pantalla (accesibilidad). Algo simple como "Estacionamiento BA Ferial (ex Costa Salguero)".
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

### 15 de julio de 2026 — Cambio de nombre a BA Ferial + ajustes de texto

- 🏟️ En toda la web y los emails, "Costa Salguero" pasó a decir **"BA Ferial (ex Costa Salguero)"** (en las menciones principales) o **"BA Ferial"** (en las repeticiones dentro de una misma pantalla, para no cargar el texto).
- ✏️ En la tarjeta "¿Quedó alguna duda?" del final de la web, el texto ahora dice *"Atención las 24 horas. Te respondemos a la brevedad por WhatsApp"* (antes decía "al toque").

### 15 de julio de 2026 — Selección de marca y modelo en la reserva

- 🚗 En el paso "Vehículo" de la reserva, la **marca** y el **modelo** ahora se eligen de una lista desplegable (con las marcas y modelos más comunes en Argentina) en vez de escribirse a mano. Es más rápido y evita errores de tipeo. Si el auto no está en la lista, la opción "Otra marca / Otro modelo" permite escribirlo libre.

### 8 de julio de 2026 — Feedback del operador (lote 4)

- 💰 **Cotizador de Aeroparque arreglado**: daba "No hay servicios disponibles" para estadías cortas (1-3 días). Tenía cargados topes viejos (mínimo 4 días / máximo 14) que no correspondían al servicio actual. Los limpiamos: ahora cotiza cualquier duración. También sacamos una tarifa vieja de "Cruceros en Aeroparque" que había quedado colgada.
- 🏷️ **Las reservas ahora muestran el precio estimado en la Agenda**: antes figuraban en $0. Ahora, al reservar, el sistema calcula el precio según la tarifa vigente y las estadías, y lo guarda. El monto final se ajusta igual al cobrar en sede.
- ℹ️ **Sobre "Datos inválidos" al reservar**: revisamos los 3 destinos y las reservas se crean correctamente. Lo que pasó en la prueba fue una combinación de (a) versión vieja de la página guardada en el navegador — se soluciona con Ctrl+F5 — y (b) fechas elegidas dentro de las 24hs de anticipación (el sistema pide mínimo 24hs). Ahora el sistema avisa exactamente qué corregir en lugar del mensaje genérico.

### 3 de junio de 2026 — Feedback del operador (lote 3)

- 📊 **Dashboard ahora muestra las reservas de Cruceros (y todas las futuras)**: antes el panel filtraba por fecha de ingreso al estacionamiento mirando solo los últimos 30 días hacia atrás, así que las reservas cargadas para viajar más adelante (ej: un crucero en julio reservado en junio) no aparecían. Ahora filtra por **fecha en que se cargó la reserva**, que es lo natural para ver "cuántas reservas entraron".
- 🚢 **Datos del crucero (naviera y terminal) ahora se guardan**: antes al reservar Cruceros esos datos no quedaban registrados. Ya se guardan y quedan en la ficha de la reserva.
- ⚠️ **Mensaje de error más claro al reservar**: si algún dato queda mal cargado, el sistema ahora dice exactamente qué campo revisar en lugar del genérico "Datos inválidos".
- 🕒 **Horario de ingreso/salida en el reporte** (ya estaba deployado, quedó del lote anterior): el reporte trae columnas "Fecha Ingreso", "Hora Ingreso", "Fecha Retiro", "Hora Retiro".

### 3 de junio de 2026 — Horario de entrada en el reporte

- 🕒 El exportador de reservas ahora incluye el **horario de entrada** (hora de ingreso) además de la fecha. Reorganizamos las columnas para que quede claro: "Fecha Ingreso", "Hora Ingreso", "Fecha Retiro", "Hora Retiro". Antes solo salían las fechas y una columna suelta "Hora Arribo".

### 3 de junio de 2026 — Feedback del operador (lote 2)

- 🚐 **Cotizador de la home + Ezeiza**: ahora al cotizar Ezeiza aparece un aviso ámbar con el costo del traslado por tramo ("Traslado opcional: $40.000 por tramo") y la etiqueta de abajo dice "Traslado opcional por tramo" en vez de "Traslado incluido". El valor sale de Tarifas, no está fijo.
- 🚐 **Reserva de Ezeiza (resumen final)**: el texto "El traslado ida y vuelta está incluido en el precio" ahora solo aparece para Aeroparque y Cruceros. Para Ezeiza dice "Traslado opcional: $40.000 por tramo. Lo coordinás y abonás al dejar el vehículo."
- ❓ **FAQ traslado**: la respuesta ahora distingue: incluido para Aeroparque/Cruceros, opcional por tramo para Ezeiza.
- 🔁 **Selector de destino trabado**: arreglado de raíz. Ahora podés cambiar entre Aeroparque, Ezeiza y Cruceros todas las veces que quieras y la página responde siempre.
- 📧 **Link roto en el email interno**: el botón "Ver en panel admin" generaba un link relativo (el programa de correo lo interpretaba como archivo local). Corregido: siempre genera la URL completa del sitio.
- 🔒 **Email interno identificado**: el mail que llega a reservas@nrauditores cuando entra una reserva ahora tiene un sello "Notificación interna — Uso del equipo" bien visible, para no confundirlo con la confirmación que recibe el cliente (esa sí tiene dirección, mapa y datos de contacto).
- ⭐ **"5 años operando en BA"** reemplazado por **"Vasta experiencia en el rubro"**.
- 📊 **Exportador de reservas arreglado**: el archivo ahora se abre en Excel con cada dato en su columna (antes salía todo en una sola columna). También se corrigieron los acentos y las fechas quedan en formato dd/mm/aaaa.

**Nota para probar la confirmación del cliente**: mientras el modo prueba de emails esté activo, la confirmación al cliente solo se envía si la reserva se hace con uno de los emails de prueba (por ejemplo reservas@nrauditores.com.ar como email del cliente). Si reservan con cualquier otro email, solo llega la notificación interna.

### 17 de mayo de 2026 — Feedback del operador (lote 1)

8 ajustes pedidos:

- 💵 **El precio del traslado a Ezeiza** ya no aparece hardcodeado como "$40k" en la descripción. Ahora se lee de la tarifa en `/admin/tarifas` y se muestra en formato completo (`$40.000`). Si querés cambiar el valor, lo hacés desde tarifas.
- ❓ **FAQ**: cambiado el texto introductorio ("¿No encontrás tu duda? Consultanos por WhatsApp...") y la respuesta sobre seguridad (sacamos "caja fuerte", ahora dice "bajo resguardo del personal a cargo").
- 🔁 **Cambio de destino en `/reservar`**: si el cliente abre la página, elige Ezeiza, vuelve atrás y desde el menú elige Aeroparque, ahora la página se actualiza correctamente al destino nuevo (antes quedaba en el viejo).
- 📧 **Email al admin**: el botón "Ver en panel admin" ahora lleva directo al detalle de la reserva en `/admin/agenda/[id]`, en vez de la página genérica.
- 📍 **Email al cliente**: la dirección "BA Ferial (ex Costa Salguero)" aparece destacada como bloque grande. Antes estaba enterrada en una lista.
- 💬 **Email al cliente**: bloque dedicado "¿Necesitás cambiar o cancelar?" con botón directo a WhatsApp. Antes era una bullet más.
- ✈️ **Datos de vuelo obligatorios** al reservar: el paso 3 (Viaje) ya no se puede saltar. Hay que cargar aerolínea + número de vuelo (salida y regreso). Para Cruceros se piden naviera + terminal.
- ⭐ **URL de reseñas configurable**: ya podés cargar la URL real de Google Reviews (o donde quieras que el cliente deje reseña) desde `/admin/settings`. Si está vacía, no se manda el email de pedido de reseña.

### 16 de mayo de 2026 — Sprint visual premium (look & feel)

Le subimos el nivel al diseño visual sin tocar la marca:

- 🎬 **Animaciones al hacer scroll**: las tarjetas, fotos y stats aparecen suavemente cuando entran a pantalla. Sensación más viva y profesional.
- 🔠 **Tipografía más impactante**: títulos principales más grandes y con mejor balance. Los números (+2.000, 4.8★, 24/7) se ven más fuertes.
- 🟡 **Botones "Reservar" con degradé**: amarillo → naranja sutil + sombra cálida. Más premium y atractivo al click.
- 🖼️ **Sección "Conocé nuestra sede"** ahora con layout asimétrico: foto grande a la izquierda + 2 chicas apiladas a la derecha. Rompe el ritmo del resto de la página y se siente más editorial.
- ✨ **Patrones de fondo sutiles**: grid de puntos en secciones claras, líneas diagonales amarillas en la barra de stats. Le da identidad propia al sitio.
- 🎯 **Sombras y micro-interacciones mejoradas**: las tarjetas levitan más al pasar el mouse, los iconos rotan suavemente, los botones tienen rebote sutil.
- ⚡ **Performance**: cero librerías externas para las animaciones (usa IntersectionObserver nativo), no afecta velocidad.

### 16 de mayo de 2026 — Imágenes migradas a storage propio

- 📦 Las 4 imágenes generadas por IA pasaron de un CDN externo a nuestro Vercel Blob propio. URLs estables para siempre, bajo nuestro control.

### 16 de mayo de 2026 — Fotos propias + tiempos realistas + sede visible

- 📸 **Hero nuevo**: foto generada por IA del estacionamiento BA Ferial (ex Costa Salguero) con valet uniformado caminando hacia cámara. Más cercano a la realidad de la operación que la foto de Blogger que estaba antes.
- 🏢 **Sección nueva "Conocé nuestra sede"** entre "Cómo funciona" y "Por qué confiar". Muestra 3 fotos: sector cubierto con cámaras, recepción con personal uniformado, y la furgoneta de traslado cargando equipaje. Incluye dirección y botón a Google Maps.
- ⏱️ **Tiempos realistas en "Cómo funciona"**: antes decía "15 min al aeropuerto" sin distinguir destinos. Ahora dice: "Aeroparque o Cruceros: 15 min. Ezeiza: 45–60 min según tráfico". Confiable.
- 🖼️ Las fotos son placeholders de IA hasta que el cliente nos pase fotos reales. En cuanto las tengamos las reemplazamos.

### 14 de mayo de 2026 — Rediseño UX para más confianza y conversión

- 💬 **WhatsApp flotante**: botón verde siempre visible abajo a la derecha en toda la web. Convierte mejor en Argentina porque la gente prefiere consultar antes de reservar.
- 📱 **Barra fija en mobile**: al scrollear, aparece una barra abajo con "Reservar ahora". Mejora conversión en celular.
- ✨ **Hero rediseñado**: copy más emocional ("Tu auto, en buenas manos. Empezás las vacaciones desde que lo dejás"), 3 stats grandes (+2.000 viajeros, 4.8★, 24/7) y trust signals visibles (seguro, cámaras, auto listo).
- 🛡️ **Banda de confianza** justo después del cotizador: 5 valores clave (seguro, cámaras, personal uniformado, traslado garantizado, recomendaciones).
- 🚗 **"Cómo funciona" rediseñado**: 4 pasos con número grande de fondo, tiempos estimados ("2 min", "15 min", etc.) y copy más cálido.
- ⭐ **Sección nueva "Lo que dicen"**: 3 testimonios con estrellas. Por ahora son ejemplos realistas que se pueden reemplazar más adelante con reseñas reales (de Google, etc.).
- 🏆 **"Por qué confiar"**: cards más visuales con stats al final (+2.000 viajeros, 4.8★, 5 años operando).
- ❓ **FAQ ampliado** con 4 preguntas nuevas: seguro, vuelo retrasado, camionetas/SUVs. Primera abierta por default, animación suave al abrir. Card de "¿Quedó alguna duda?" con botón directo a WhatsApp.
- 🎯 **CTA final más punchy**: badge con rating, copy "Tu próximo viaje empieza en BA Ferial (ex Costa Salguero)", garantías (cancelación gratis, sin cargos ocultos, seguro incluido).

### 14 de mayo de 2026 — Limpieza total AA2000

- 🧹 Sacamos toda referencia a Aeropuertos Argentina del sistema. El cotizador, los formularios, el panel de tarifas y los emails ya no muestran nada relacionado a "checkout externo" ni redirigen a tiendas externas.
- 🗑️ Desactivado el flujo viejo que importaba reservas por email desde AA2000. Hoy todas las reservas se cargan desde la web propia.
- 🔧 En "Tarifas" desapareció el checkbox "Es precio de referencia" y el campo "URL externa" — ya no aplican.
- 📧 Mails de confirmación: los links a "Gestionar mi reserva" ahora siempre van a la URL pública de Aeroparking (antes podía aparecer un link a localhost si alguien testeaba en local — defensa agregada).

### 14 de mayo de 2026 — Operación propia + bug Ezeiza

- 🛬 **Aeroparque ahora es operación propia**: la larga estadía deja de redirigir a la tienda de Aeropuertos Argentina (AA2000). El cliente reserva directo con nosotros, mismo flujo que Cruceros y Ezeiza.
- 🔧 **Bug fix Ezeiza**: el cotizador de la home tiraba "No hay servicios disponibles para esas fechas" al elegir Ezeiza. Era una inconsistencia interna en la configuración de la tarifa. Resuelto.
- 🛑 **Drop & Go Aeroparque queda desactivado**: no operamos drop & go dentro del aeropuerto. Si en el futuro lo queremos ofrecer, se activa desde Tarifas.

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

---

## 17. Escáner de ingreso / retiro (QR)

**URL**: [aeroparking.vercel.app/admin/scan](https://aeroparking.vercel.app/admin/scan)

Cada reserva genera un código QR que le llega al cliente en el email de confirmación. Con el escáner registrás cuándo el auto **entra** y cuándo **se retira**, sin buscar la reserva a mano.

### Cómo usarlo

1. Entrá a **Escáner** (📷 en el menú) desde el celular.
2. Elegí qué querés registrar arriba:
   - **Automático** (recomendado): el primer escaneo de una reserva registra el ingreso, el segundo el retiro.
   - **Ingreso** o **Retiro**: forzás uno u otro.
3. Tocá **"Escanear QR"** → se abre la cámara → apuntá al QR del cliente.
4. La pantalla te muestra en verde ✓ si se registró, o en rojo ✗ con el motivo si algo no cierra (ej: reserva cancelada, ya registrada).

### Si la cámara no lee el QR

Debajo del botón de la cámara hay un campo **"Ingresá el código"**. Pedile al cliente el código de 6 letras que figura en su email (ej: `A7K2QP`) y escribilo ahí → **Buscar**.

### Qué pasa al escanear

- **Ingreso**: la reserva pasa a estado "En sede" y queda registrada la hora real.
- **Retiro**: la reserva pasa a "Completada" con la hora real de salida.

---

## 18. Vista del día

**URL**: [aeroparking.vercel.app/admin/dia](https://aeroparking.vercel.app/admin/dia)

Es la pantalla que el personal abre a la mañana para saber **qué autos vienen hoy**. Muestra las reservas ordenadas por hora, con todos los datos que necesitás.

### Cómo usarla

- Arriba elegís **Ingresos** (autos que llegan) o **Retiros** (autos que se van) ese día.
- Con las flechas **← Hoy →** te movés entre días. Podés preparar la lista del día siguiente la noche anterior.
- Cada fila muestra: hora, cliente, patente, vehículo, destino, vuelo y una casilla para tildar.
- Botón **Imprimir**: saca la lista en papel (sin los menús, solo la tabla) para tenerla a mano en la playa.

La casilla de la derecha se tilda sola en verde cuando el auto ya registró su ingreso/retiro por el escáner, o la podés tildar a mano en la copia impresa.
