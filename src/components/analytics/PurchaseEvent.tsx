"use client";

import { useEffect } from "react";
import { trackPurchase, type PurchaseData } from "@/lib/analytics";

/** Avisa la compra una sola vez por reserva, aunque recarguen la página. */
export function PurchaseEvent({ transactionId, value, destination, serviceType }: PurchaseData) {
  useEffect(() => {
    trackPurchase({ transactionId, value, destination, serviceType });
  }, [transactionId, value, destination, serviceType]);

  return null;
}
