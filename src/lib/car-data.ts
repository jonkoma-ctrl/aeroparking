/**
 * Marcas y modelos de autos más comunes en Argentina.
 * Usado en el form de reserva para acelerar la carga con selectores.
 * La opción "Otro" siempre permite escribir libre (marcas/modelos raros).
 */
export const CAR_BRANDS: Record<string, string[]> = {
  Volkswagen: ["Gol", "Gol Trend", "Polo", "Virtus", "Vento", "Voyage", "Suran", "Amarok", "T-Cross", "Taos", "Nivus", "Golf", "Passat", "Saveiro"],
  Toyota: ["Etios", "Yaris", "Corolla", "Corolla Cross", "Hilux", "SW4", "RAV4", "Camry", "Prius", "Hiace"],
  Chevrolet: ["Onix", "Onix Plus", "Prisma", "Cruze", "Tracker", "Spin", "S10", "Trailblazer", "Cobalt", "Agile", "Corsa", "Classic"],
  Ford: ["Ka", "Fiesta", "Focus", "Ecosport", "Territory", "Ranger", "Kuga", "Mondeo", "Bronco", "Maverick"],
  Fiat: ["Cronos", "Argo", "Mobi", "Pulse", "Fastback", "Toro", "Strada", "Palio", "Siena", "Uno", "Punto", "500"],
  Renault: ["Kwid", "Sandero", "Logan", "Stepway", "Duster", "Oroch", "Captur", "Kangoo", "Alaskan", "Koleos", "Clio", "Fluence"],
  Peugeot: ["208", "2008", "308", "3008", "408", "5008", "Partner", "Expert", "Boxer", "207", "307"],
  Citroen: ["C3", "C4 Cactus", "C4 Lounge", "C5 Aircross", "Berlingo", "Jumpy", "Jumper", "C-Elysée"],
  Nissan: ["March", "Versa", "Sentra", "Kicks", "X-Trail", "Frontier", "Note"],
  Honda: ["Fit", "City", "Civic", "HR-V", "CR-V", "WR-V"],
  Jeep: ["Renegade", "Compass", "Commander", "Wrangler", "Grand Cherokee"],
  Hyundai: ["HB20", "Creta", "Tucson", "Santa Fe", "Kona", "i10", "Elantra"],
  Kia: ["Rio", "Cerato", "Sportage", "Seltos", "Sorento", "Picanto", "Soul"],
  Mercedes: ["Clase A", "Clase C", "Clase E", "GLA", "GLC", "GLE", "Vito", "Sprinter"],
  BMW: ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5"],
  Audi: ["A1", "A3", "A4", "Q2", "Q3", "Q5"],
  Suzuki: ["Swift", "Baleno", "Vitara", "S-Cross", "Jimny"],
  Mitsubishi: ["L200", "Outlander", "ASX", "Montero"],
  Dodge: ["Journey", "Ram 1500"],
  RAM: ["1500", "700", "Rampage"],
};

/** Lista ordenada de marcas para el <select>. */
export const CAR_BRAND_NAMES = Object.keys(CAR_BRANDS).sort();

/** Devuelve los modelos de una marca (vacío si no existe). */
export function modelsForBrand(brand: string): string[] {
  return CAR_BRANDS[brand] ?? [];
}
