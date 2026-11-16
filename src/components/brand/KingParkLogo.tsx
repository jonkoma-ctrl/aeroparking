/**
 * Logo KingPark (propuesta B aprobada por Jon, 16-nov-2026).
 * Concepto: la "E" acostada es la corona (lomo abajo + tres brazos con punta)
 * y las letras van en casilleros, como cocheras.
 *
 * - KingParkCrown: la corona sola (viewBox 100×40).
 * - KingParkMark: ícono cuadrado (corona dorada sobre azul) para favicon/redes.
 * - KingParkLogo: versión horizontal (corona + KINGPARK en 8 casilleros).
 *   tone="light" para fondos claros, "dark" para fondos oscuros.
 */

export const LOGO_BLUE = "#1b3fc4";
export const CROWN_GOLD = "#fbb820";
const CROWN_GOLD_ON_LIGHT = "#eb9d08"; // un punto más oscuro para que se lea sobre blanco

export function CrownPaths({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <rect x="0" y="28" width="100" height="12" />
      <path d="M0 28V0L24 16V28Z" />
      <path d="M38 28V16L50 0L62 16V28Z" />
      <path d="M100 28V0L76 16V28Z" />
    </g>
  );
}

export function KingParkCrown({ className = "h-6 w-auto", color = CROWN_GOLD }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 40" className={className} aria-hidden="true">
      <CrownPaths fill={color} />
    </svg>
  );
}

export function KingParkMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill={LOGO_BLUE} />
      <svg x="10" y="16" width="44" height="17.6" viewBox="0 0 100 40">
        <CrownPaths fill={CROWN_GOLD} />
      </svg>
      <rect x="10" y="38" width="44" height="3.5" fill={CROWN_GOLD} />
      <rect x="10" y="45" width="44" height="3.5" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

const LETTERS = ["K", "I", "N", "G", "P", "A", "R", "K"];
const CELL = 214 / 8;

export function KingParkLogo({
  tone = "light",
  className = "h-9 w-auto",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const crown = tone === "light" ? CROWN_GOLD_ON_LIGHT : CROWN_GOLD;
  const ink = tone === "light" ? LOGO_BLUE : "#ffffff";
  return (
    <svg viewBox="0 0 330 80" className={className} role="img" aria-label="KingPark">
      <svg x="0" y="12" width="100" height="40" viewBox="0 0 100 40">
        <CrownPaths fill={crown} />
      </svg>
      <rect x="0" y="58" width="100" height="6" fill={crown} />
      <g fill="none" stroke={ink} strokeWidth="2.4">
        <rect x="114" y="13" width="214" height="51" />
        {LETTERS.slice(1).map((_, i) => {
          const x = 114 + CELL * (i + 1);
          return <path key={i} d={`M${x} 13V64`} />;
        })}
      </g>
      <g
        fill={ink}
        fontSize="34"
        textAnchor="middle"
        style={{ fontFamily: "var(--font-logo), 'Arial Narrow', Arial, sans-serif", fontWeight: 900, fontStretch: "75%" }}
      >
        {LETTERS.map((l, i) => (
          <text key={i} x={114 + CELL * i + CELL / 2} y="51">
            {l}
          </text>
        ))}
      </g>
    </svg>
  );
}
