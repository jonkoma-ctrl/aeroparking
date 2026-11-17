/** Políticas de Border's Parking SRL (respuesta del 16/17-nov-2026). */
export const MIN_ADVANCE_HOURS = 12; // anticipación mínima para reservar online
export const CANCEL_REFUND_HOURS = 24; // devolución del 100 % si cancela hasta 24 h antes del ingreso

/** Terminal de cruceros a la que llevamos (la única del Puerto de Buenos Aires). */
export const CRUISE_TERMINAL = {
  name: "Terminal de Cruceros Quinquela Martín",
  short: "Terminal Quinquela Martín",
  address: "Av. Pres. Ramón S. Castillo 13, CABA",
};

export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "KingPark";

/// Datos de contacto que se muestran al cliente en CTAs y mails.
/// Mantener sincronizado con email-templates.ts y Settings (cuando exista en DB).
export const CONTACT = {
  phone: "11 3160 6994",
  whatsapp: "5491131606994",
  email: "reservas@nrauditores.com.ar",
  address: "BA Ferial (ex Costa Salguero), Ciudad Autónoma de Buenos Aires",
};

/// Anticipación mínima al reservar online (en horas). Para reservas con menos
/// anticipación, derivar al cliente a llamar por teléfono.
export const RESERVATION_LEAD_HOURS = 24;

export const FAQ_ITEMS = [
  {
    question: "¿Con cuánta anticipación tengo que reservar?",
    answer:
      "Las reservas online se aceptan con al menos 12 horas de anticipación. Si necesitás algo más urgente, escribinos por WhatsApp al 11 3160 6994 y lo coordinamos.",
  },
  {
    question: "¿El traslado está incluido?",
    answer:
      "Sí: el precio incluye el traslado ida y vuelta en nuestras unidades a Aeroparque y a la Terminal de Cruceros Quinquela Martín (Av. Pres. Ramón S. Castillo 13), sin costo adicional.",
  },
  {
    question: "¿Cómo y cuándo se paga?",
    answer:
      "Se paga online al reservar, con Mercado Pago: tarjeta de crédito, débito o dinero en cuenta. Apenas se aprueba el pago te llega el mail con tu código QR, y al llegar a BA Ferial (ex Costa Salguero) no tenés que abonar nada.",
  },
  {
    question: "¿Qué pasa si me cancelan el vuelo?",
    answer:
      "Si ya dejaste el vehículo y te cancelan el vuelo, contás con 3 horas para retirarlo sin cargo. Pasado ese tiempo, la estadía se cobra o queda como crédito a favor para tu próximo viaje.",
  },
  {
    question: "¿Puedo cancelar la reserva?",
    answer:
      "Sí. Si cancelás hasta 24 horas antes de la fecha de ingreso, te devolvemos el 100 % de lo que pagaste. Pedila desde «Mi reserva» (el botón del mail de confirmación) o por WhatsApp. Con menos de 24 horas ya no hay devolución.",
  },
  {
    question: "¿El estacionamiento es seguro?",
    answer:
      "Sí. Sector propio cubierto en BA Ferial (ex Costa Salguero), vigilancia 24h con cámaras, personal uniformado en sede y registro firmado de ingreso y egreso de cada vehículo. Las llaves quedan bajo resguardo del personal a cargo.",
  },
  {
    question: "¿Está cubierto por seguro?",
    answer:
      "Sí. Tu auto cuenta con seguro de responsabilidad civil mientras está bajo nuestra custodia. Para cualquier reclamo, el comprobante de ingreso firmado funciona como respaldo.",
  },
  {
    question: "¿Qué pasa si mi vuelo de regreso se retrasa?",
    answer:
      "Avisanos por WhatsApp al 11 3160 6994 cuando aterrices y coordinamos el horario real de tu llegada. Tu reserva cubre el día de retiro hasta las 23:59: si por la demora retirás el auto después de la medianoche, se cobra una estadía extra.",
  },
  {
    question: "¿Atienden camionetas, SUVs o vehículos grandes?",
    answer:
      "Sí, atendemos todo tipo de vehículos de pasajeros: autos, SUVs, camionetas y minivans. El precio es el mismo, no varía por tamaño del vehículo.",
  },
  {
    question: "¿Qué tipo de factura emiten?",
    answer:
      "Emitimos factura A o B según lo necesite el cliente. Para factura A te pedimos CUIT y razón social al momento de cobrar.",
  },
  {
    question: "¿Hacen Valet Parking para eventos?",
    answer:
      "Sí. Operamos Valet Parking con personal propio uniformado para galas, fiestas, shows, desfiles y eventos privados. Cada caso se cotiza por separado — completá el formulario en /valet-eventos y te contactamos.",
  },
];

/// Tipos de evento para el form de Valet eventos.
export const EVENT_TYPES = [
  "Gala",
  "Fiesta",
  "Show / Sector VIP",
  "Desfile",
  "Cocktail",
  "Cena",
  "Muestra",
  "Otro",
] as const;

export const CRUISE_LINES = [
  "MSC Cruceros",
  "Costa Cruceros",
  "Royal Caribbean",
  "Norwegian Cruise Line",
  "Celebrity Cruises",
  "Holland America",
  "Princess Cruises",
  "Otra",
];

export const TERMINALS = ["Terminal de Cruceros Quinquela Martín"];
