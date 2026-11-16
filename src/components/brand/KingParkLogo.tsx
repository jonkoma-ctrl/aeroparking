/**
 * Logo KingPark: símbolo (corona sobre una "P" en un escudo redondeado) +
 * nombre. `tone="light"` para fondos claros, `"dark"` para fondos oscuros.
 */
export function KingParkMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#16223f" />
      {/* Corona */}
      <path
        d="M18 23 L22.5 12.5 L28 19 L32 10 L36 19 L41.5 12.5 L46 23 Z"
        fill="#fbb820"
        stroke="#fbb820"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="11.5" r="2" fill="#fbb820" />
      <circle cx="32" cy="9" r="2" fill="#fbb820" />
      <circle cx="41.5" cy="11.5" r="2" fill="#fbb820" />
      {/* P */}
      <path
        d="M24 54 V28 H34.5 C40.6 28 44.5 31.6 44.5 37.2 C44.5 42.8 40.6 46.4 34.5 46.4 H30.5 V54 Z M30.5 40.9 H34 C36.6 40.9 38 39.5 38 37.2 C38 34.9 36.6 33.5 34 33.5 H30.5 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function KingParkLogo({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const king = tone === "light" ? "text-brand-900" : "text-white";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <KingParkMark className="h-9 w-9 shrink-0" />
      <span className="font-display text-[1.4rem] leading-none tracking-[-0.03em]">
        <span className={`font-extrabold ${king}`}>King</span>
        <span className="font-semibold text-accent-500">Park</span>
      </span>
      <span className="sr-only">KingPark</span>
    </span>
  );
}
