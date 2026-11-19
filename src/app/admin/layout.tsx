import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, sessionRole } from "@/lib/admin-auth";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/dia", label: "Vista del día", icon: "🗓️" },
  { href: "/admin/scan", label: "Escáner", icon: "📷" },
  { href: "/admin/agenda", label: "Agenda", icon: "📋" },
  { href: "/admin/tarifas", label: "Tarifas", icon: "💰" },
  { href: "/admin/destinos", label: "Destinos", icon: "📍" },
  { href: "/admin/creditos", label: "Créditos", icon: "🎁" },
  { href: "/admin/settings", label: "Ajustes", icon: "⚙️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Con la clave del escáner no se muestra el menú del panel.
  const role = await sessionRole((await cookies()).get(ADMIN_COOKIE)?.value);
  if (role === "scanner") return <main className="min-w-0">{children}</main>;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col md:flex-row">
      {/* Celular: menú horizontal deslizable arriba. Oculto al imprimir. */}
      <nav className="sticky top-20 z-30 flex gap-1 overflow-x-auto border-b border-brand-200 bg-brand-50/95 px-2 py-2 backdrop-blur md:hidden print:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-white hover:text-brand-900"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Compu: menú lateral. Oculto al imprimir. */}
      <aside className="hidden w-56 shrink-0 border-r border-brand-200 bg-brand-50 p-4 md:block print:hidden">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="text-lg font-bold text-brand-900">
            Admin
          </Link>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-white hover:text-brand-900"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenido: min-w-0 para que tablas anchas scrolleen adentro y no empujen la página */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
