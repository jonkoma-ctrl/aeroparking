export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type AeroparqueServiceType = "drop_go" | "larga_estadia";

export interface AeroparqueReservation {
  id: string;
  externalOrderId: string;
  status: string;
  serviceType: AeroparqueServiceType;
  customerName: string;
  email: string | null;
  phone: string | null;
  dni: string | null;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  startDate: string;
  endDate: string;
  price: number;
  departureFlightDate: string | null;
  departureAirline: string | null;
  departureFlight: string | null;
  arrivalAirline: string | null;
  arrivalFlight: string | null;
  arrivalTime: string | null;
  passengers: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CruiseReservation {
  id: string;
  status: ReservationStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departureDate: string;
  arrivalTime: string;
  returnDate: string;
  pickupTime: string;
  passengers: number;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  cruiseLine?: string | null;
  terminal?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  href: string;
  icon: "car" | "clock" | "ship";
  features: readonly string[];
  steps: readonly {
    title: string;
    description: string;
  }[];
  externalUrl?: string;
  bookingHref?: string;
}
