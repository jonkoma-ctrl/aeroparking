import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    cancelled: "Cancelada",
    completed: "Completada",
    no_show: "No se presentó",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    no_show: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getPaymentLabel(status: string): string {
  const labels: Record<string, string> = {
    paid: "Pagado",
    pending: "Pago pendiente",
    refunded: "Reembolsado",
  };
  return labels[status] || status;
}

export function getPaymentColor(status: string): string {
  const colors: Record<string, string> = {
    paid: "bg-emerald-100 text-emerald-800",
    pending: "bg-orange-100 text-orange-800",
    refunded: "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getServiceLabel(type: string): string {
  const labels: Record<string, string> = {
    drop_go: "Drop & Go",
    larga_estadia: "Larga Estadía",
    cruceros: "Cruceros",
  };
  return labels[type] || type;
}

export function getServiceColor(type: string): string {
  const colors: Record<string, string> = {
    drop_go: "bg-blue-100 text-blue-800",
    larga_estadia: "bg-sky-100 text-sky-800",
    cruceros: "bg-violet-100 text-violet-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
