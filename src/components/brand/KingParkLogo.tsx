/**
 * Logo KingPark — versión A (original de Jon), colores del cartel de
 * "estacionamiento permitido": azul, celeste y blanco (Jon, 17-nov-2026).
 *
 * Concepto: la "E" acostada recortada en el bloque es la corona, y las letras
 * van en casilleros, como cocheras.
 *
 * - CrownA: la corona (viewBox 100×40). `cut` = color del recorte (el fondo).
 * - KingParkMark: ícono cuadrado (E-corona blanca sobre azul, como el cartel).
 * - KingParkLogo: horizontal (corona + KINGPARK en 8 casilleros).
 *   tone="light" fondos claros, "dark" fondos oscuros.
 */

export const LOGO_BLUE = "#1b3fc4";
export const LOGO_CELESTE = "#4fb6ec";
export const LOGO_WHITE = "#ffffff";

/** Corona: bloque con la "E" recortada (el recorte es transparente, se ve el fondo). */
export function CrownA({ fill }: { fill: string; cut?: string }) {
  return (
    <g fill={fill}>
      <path fillRule="evenodd" d="M0 0H100V40H0Z M34 0L24 14V26H76V14L66 0Z" />
      <path d="M38 13H62L54 20V26H46V20Z" />
    </g>
  );
}

export function KingParkMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="12" fill={LOGO_BLUE} />
      <svg x="10" y="13" width="44" height="17.6" viewBox="0 0 100 40">
        <CrownA fill={LOGO_WHITE} cut={LOGO_BLUE} />
      </svg>
      <rect x="10" y="35" width="44" height="3.5" fill={LOGO_CELESTE} />
      <rect x="10" y="42" width="44" height="3.5" fill={LOGO_WHITE} />
      <rect x="10" y="49" width="44" height="3.5" fill={LOGO_CELESTE} />
    </svg>
  );
}

const LETTERS = ["K", "I", "N", "G", "P", "A", "R", "K"];
const CELL = 214 / 8;

export function KingParkLogo({
  tone = "light",
  className = "h-9 w-auto",
  background,
}: {
  tone?: "light" | "dark";
  className?: string;
  /** Color del fondo donde va el logo (para el recorte de la corona). */
  background?: string;
}) {
  const ink = tone === "light" ? LOGO_BLUE : LOGO_WHITE;
  const cut = background ?? (tone === "light" ? LOGO_WHITE : "#0d1940");
  return (
    <svg viewBox="0 0 330 80" className={className} role="img" aria-label="KingPark">
      <svg x="0" y="12" width="100" height="40" viewBox="0 0 100 40">
        <CrownA fill={ink} cut={cut} />
      </svg>
      <rect x="0" y="58" width="100" height="6" fill={LOGO_CELESTE} />
      <g fill="none" stroke={ink} strokeWidth="2.4">
        <rect x="114" y="13" width="214" height="51" />
        {LETTERS.slice(1).map((_, i) => {
          const x = 114 + CELL * (i + 1);
          return <path key={i} d={`M${x} 13V64`} />;
        })}
      </g>
      <rect x="114" y="68" width="214" height="4" fill={LOGO_CELESTE} />
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
