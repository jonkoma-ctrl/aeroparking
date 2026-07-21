export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "AEROPARKING";

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
      "Las reservas online se aceptan con al menos 24 horas de anticipación. Si necesitás algo más urgente, llamanos al 11 3160 6994 y lo coordinamos por teléfono.",
  },
  {
    question: "¿El traslado está incluido?",
    answer:
      "Para Aeroparque y la Terminal de Cruceros, sí: el precio incluye el traslado ida y vuelta en nuestras unidades, sin costo adicional. Para Ezeiza, el traslado es opcional y se abona por tramo (ida y/o vuelta) — el valor te lo mostramos al cotizar.",
  },
  {
    question: "¿Cómo y cuándo se paga?",
    answer:
      "El pago se realiza en el momento que dejás el vehículo en nuestro estacionamiento de BA Ferial (ex Costa Salguero). Aceptamos efectivo, tarjeta y transferencia.",
  },
  {
    question: "¿Qué pasa si me cancelan el vuelo?",
    answer:
      "Si ya dejaste el vehículo y te cancelan el vuelo, contás con 3 horas para retirarlo sin cargo. Pasado ese tiempo, la estadía se cobra o queda como crédito a favor para tu próximo viaje.",
  },
  {
    question: "¿Puedo cancelar la reserva?",
    answer:
      "Sí. Como el pago se hace al dejar el vehículo, cancelar antes del ingreso no tiene costo. Avisanos por mail o teléfono así liberamos el lugar.",
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
      "Avisanos por WhatsApp al 11 3160 6994 cuando aterrices. Tenemos atención las 24 horas y coordinamos el horario real de tu llegada — no tenés que pagar nada extra por demoras del vuelo.",
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

export const TERMINALS = [
  "Terminal Benito Quinquela Martín",
  "Terminal 2 - Puerto Nuevo",
];
