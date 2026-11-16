import { ImageResponse } from "next/og";

// GET /brand/logo.png?tone=dark|light — logo KingPark en PNG para los mails
// (Gmail no muestra SVG). Mismo dibujo que components/brand/KingParkLogo.tsx.
export const revalidate = 86400;

const BLUE = "#1b3fc4";
const GOLD = "#fbb820";
const GOLD_ON_LIGHT = "#eb9d08";
const LETTERS = ["K", "I", "N", "G", "P", "A", "R", "K"];

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75,900").then((r) => r.text());
    const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const dark = new URL(req.url).searchParams.get("tone") === "dark";
  const crown = dark ? GOLD : GOLD_ON_LIGHT;
  const ink = dark ? "#ffffff" : BLUE;
  const font = await loadFont();
  const S = 2; // escala (retina)

  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "flex-end", width: 330 * S, height: 80 * S, padding: 0, background: dark ? "#152766" : "#ffffff" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 100 * S, marginBottom: 16 * S, marginRight: 14 * S }}>
          <svg width={100 * S} height={40 * S} viewBox="0 0 100 40">
            <g fill={crown}>
              <rect x="0" y="28" width="100" height="12" />
              <path d="M0 28V0L24 16V28Z" />
              <path d="M38 28V16L50 0L62 16V28Z" />
              <path d="M100 28V0L76 16V28Z" />
            </g>
          </svg>
          <div style={{ display: "flex", height: 6 * S, background: crown, marginTop: 6 * S }} />
        </div>
        <div
          style={{
            display: "flex",
            border: `${2.4 * S}px solid ${ink}`,
            marginBottom: 16 * S,
            height: 51 * S,
          }}
        >
          {LETTERS.map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: (214 / 8) * S - (i === 0 ? 2.4 * S : 0),
                borderLeft: i === 0 ? "none" : `${2.4 * S}px solid ${ink}`,
                color: ink,
                fontSize: 34 * S,
                fontFamily: "Archivo",
                fontWeight: 900,
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 330 * S,
      height: 80 * S,
      fonts: font ? [{ name: "Archivo", data: font, weight: 900, style: "normal" }] : undefined,
    }
  );
}
