export const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "AEROPARKING";

/// Datos de contacto que se muestran al cliente en CTAs y mails.
/// Mantener sincronizado con email-templates.ts y Settings (cuando exista en DB).
export const CONTACT = {
  phone: "11 3160 6994",
  whatsapp: "5491131606994",
  email: "reservas@nrauditores.com.ar",
  address: "Costa Salguero, Ciudad Autónoma de Buenos Aires",
};

export const EXTERNAL_URLS = {
  valet:
    process.env.NEXT_PUBLIC_VALET_URL ||
    "https://tienda.aeropuertosargentina.com/aeroparque/producto/valet-parking/",
  longStay:
    process.env.NEXT_PUBLIC_LONG_STAY_URL ||
    "https://tienda.aeropuertosargentina.com/aeroparque/producto/larga-estadia-4-dias-o-mas/",
};

export const SERVICES = {
  valet: {
    id: "valet",
    name: "Valet Parking Aeroparque",
    shortName: "Drop & Go",
    tagline: "Llegás, entregás las llaves y volás tranquilo",
    description:
      "Servicio de valet parking en Aeroparque Jorge Newbery. Dejá tu vehículo en la puerta y nuestro personal lo estaciona por vos.",
    href: "/servicios/valet-parking",
    externalUrl: EXTERNAL_URLS.valet,
    icon: "car" as const,
    features: [
      "Entrega en puerta de Aeroparque",
      "Personal especializado",
      "Reserva con anticipación",
      "Retiro coordinado al regreso",
      "Seguro incluido",
    ],
    steps: [
      {
        title: "Reservá online",
        description: "Completá tus datos de vuelo y vehículo con anticipación.",
      },
      {
        title: "Llegá a Aeroparque",
        description:
          "Dirigite al punto de entrega indicado en la terminal.",
      },
      {
        title: "Entregá tu vehículo",
        description:
          "Nuestro personal retira tu auto y lo estaciona de forma segura.",
      },
      {
        title: "Volá tranquilo",
        description:
          "Al regresar, coordiná el retiro y tu auto te espera listo.",
      },
    ],
  },
  longStay: {
    id: "longStay",
    name: "Larga Estadía Aeroparque",
    shortName: "Larga Estadía",
    tagline: "Estacioná de 4 a 14 días con traslado incluido",
    description:
      "Estacionamiento en Costa Salguero con transfer ida y vuelta a Aeroparque. Ideal para viajes largos.",
    href: "/servicios/larga-estadia",
    externalUrl: EXTERNAL_URLS.longStay,
    icon: "clock" as const,
    features: [
      "Estadías de 4 a 14 días",
      "Transfer incluido a Aeroparque",
      "Parking vigilado 24hs",
      "Regreso desde Aeroparque al parking",
      "Reserva anticipada",
    ],
    steps: [
      {
        title: "Reservá tu lugar",
        description:
          "Elegí las fechas de tu viaje y reservá con anticipación.",
      },
      {
        title: "Dejá tu auto",
        description:
          "Llevá tu vehículo al estacionamiento en Costa Salguero.",
      },
      {
        title: "Transfer a Aeroparque",
        description:
          "Te trasladamos al aeropuerto cómodamente. El transfer está incluido.",
      },
      {
        title: "Regreso sin complicaciones",
        description:
          "Al volver, tomá el transfer desde Aeroparque hasta tu auto.",
      },
    ],
  },
  cruises: {
    id: "cruises",
    name: "Terminal de Cruceros",
    shortName: "Cruceros",
    tagline: "Dejá tu auto seguro y te llevamos al puerto",
    description:
      "Estacioná tu vehículo en nuestro parking y te trasladamos hasta la terminal de cruceros de Buenos Aires.",
    href: "/servicios/terminal-cruceros",
    bookingHref: "/reservar/cruceros",
    icon: "ship" as const,
    features: [
      "Traslado al puerto incluido",
      "Parking vigilado 24hs",
      "Estadías flexibles",
      "Retiro coordinado",
      "Atención personalizada",
    ],
    steps: [
      {
        title: "Reservá online",
        description:
          "Completá el formulario con tus datos de viaje y vehículo.",
      },
      {
        title: "Dejá tu auto",
        description:
          "Llevá tu vehículo a nuestro parking en el horario acordado.",
      },
      {
        title: "Te llevamos al puerto",
        description:
          "Te trasladamos hasta la terminal de cruceros de forma segura.",
      },
      {
        title: "Disfrutá tu crucero",
        description:
          "Al regresar, tu auto te espera listo para retirarlo.",
      },
    ],
  },
} as const;

export const FAQ_ITEMS = [
  {
    question: "¿Con cuánta anticipación debo reservar?",
    answer:
      "Recomendamos reservar con al menos 48 horas de anticipación para garantizar disponibilidad. En temporada alta, sugerimos hacerlo con mayor margen.",
  },
  {
    question: "¿Qué pasa si mi vuelo se retrasa?",
    answer:
      "No te preocupes. Monitoreamos los vuelos y ajustamos la logística. Comunicáte con nosotros si hay cambios y coordinaremos el retiro de tu vehículo.",
  },
  {
    question: "¿El estacionamiento es seguro?",
    answer:
      "Todos nuestros parkings son bajo techo y cuentan con vigilancia 24 horas, cámaras de seguridad y seguro incluido para tu tranquilidad.",
  },
  {
    question: "¿Puedo cancelar mi reserva?",
    answer:
      "Sí, podés cancelar hasta 24 horas antes sin cargo. Para cancelaciones tardías, consultá nuestra política de cancelación.",
  },
  {
    question: "¿Qué incluye el servicio de traslado?",
    answer:
      "El traslado está incluido en el precio del servicio. Te llevamos desde el parking en Costa Salguero hasta Aeroparque Jorge Newbery y viceversa. El viaje dura aproximadamente 15 minutos.",
  },
  {
    question: "¿Cuál es la diferencia entre Valet Parking y Larga Estadía?",
    answer:
      "Con Valet Parking entregás tu auto directamente en Aeroparque y el personal lo estaciona. Con Larga Estadía, dejás el auto en Costa Salguero y tomás un transfer al aeropuerto. Larga Estadía es ideal para viajes de 4 a 14 días.",
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
