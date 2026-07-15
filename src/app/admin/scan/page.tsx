import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { ScanClient } from "@/components/admin/ScanClient";

export const metadata: Metadata = {
  title: `Escáner — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-brand-50">
      <div className="border-b border-brand-200 bg-white px-4 py-4">
        <h1 className="text-center text-lg font-bold text-brand-900">
          Escáner de ingreso / retiro
        </h1>
        <p className="text-center text-xs text-brand-500">
          Escaneá el QR del cliente o ingresá el código
        </p>
      </div>
      <ScanClient />
    </div>
  );
}
