export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "AEROPARKING";

/// Datos de contacto que se muestran al cliente. Mantener sincronizado con Settings en DB.
export const CONTACT = {
  phone: "11 3160 6994",
  whatsapp: "5491131606994",
  email: "reservas@nrauditores.com.ar",
  address: "Costa Salguero, Ciudad Autónoma de Buenos Aires",
};

/// Destinos disponibles. En runtime se sirve desde la DB (model Destination),
/// estos slugs deben matchear los del seed.
export const DESTINATION_SLUGS = ["aeroparque", "ezeiza", "cruceros"] as const;
export type DestinationSlug = (typeof DESTINATION_SLUGS)[number];

export const FAQ_ITEMS = [
  {
    question: "¿Con cuánta anticipación tengo que reservar?",
    answer:
      "Las reservas online se aceptan con al menos 24 horas de anticipación. Si necesitás algo más urgente, llamanos al 11 3160 6994 y lo coordinamos por teléfono.",
  },
  {
    question: "¿El traslado al aeropuerto está incluido?",
    answer:
      "Sí. El precio incluye el traslado ida y vuelta en nuestras unidades, sin costo adicional. Cubrimos Aeroparque, Ezeiza y la Terminal de Cruceros.",
  },
  {
    question: "¿Cómo y cuándo se paga?",
    answer:
      "El pago se realiza en el momento que dejás el vehículo en nuestro estacionamiento de Costa Salguero. Aceptamos efectivo, tarjeta y transferencia.",
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
      "Sí. Tenemos sector de estacionamiento propio cubierto en Costa Salguero, con seguridad las 24 horas y registro de ingreso y egreso de cada vehículo.",
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
