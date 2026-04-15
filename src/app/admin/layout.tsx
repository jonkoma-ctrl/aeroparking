import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin/agenda", label: "Agenda", icon: "📋" },
  { href: "/admin/reservas", label: "Cruceros", icon: "🚢" },
  { href: "/admin/tarifas", label: "Tarifas", icon: "💰" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-brand-200 bg-brand-50 p-4">
        <div className="mb-6">
          <Link href="/admin/agenda" className="text-lg font-bold text-brand-900">
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

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
