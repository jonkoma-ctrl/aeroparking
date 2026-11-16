import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KingPark — tinta azul marino "realeza nocturna", identidad principal
        brand: {
          50: "#f3f5fa",
          100: "#e4e9f3",
          200: "#c6d0e6",
          300: "#9cadd2",
          400: "#6d85b9",
          500: "#4c66a0",
          600: "#3a4f86",
          700: "#2e3f6c",
          800: "#223055",
          900: "#16223f",
          950: "#0c1428",
        },
        // Dorado corona — CTAs, highlights y la corona del logo
        accent: {
          50: "#fffaeb",
          100: "#fff1c4",
          200: "#ffe187",
          300: "#ffcd48",
          400: "#fbb820",
          500: "#eb9d08",
          600: "#cb7a04",
          700: "#a25708",
          800: "#85450e",
          900: "#6e3a10",
        },
        // Acento secundario champagne/rose-gold — calidez premium
        warm: {
          50: "#fdf8f3",
          100: "#fbeee0",
          200: "#f5d9ba",
          300: "#edbe89",
          400: "#e09c58",
          500: "#d18039",
          600: "#bd6a2f",
          700: "#9d5429",
          800: "#7e4327",
          900: "#653725",
        },
        // Orange — el color real de la chomba del personal
        uniform: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        // Huge type para Hero
        "huge-1": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "800" }],
        "huge-2": ["clamp(2rem, 5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" }],
        "huge-3": ["clamp(1.75rem, 4vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        "stat-xl": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1", letterSpacing: "-0.04em", fontWeight: "900" }],
      },
      boxShadow: {
        // Sombras layered con tinte azul, no grises
        elevated:
          "0 1px 2px rgba(22, 34, 63, 0.04), 0 8px 24px rgba(22, 34, 63, 0.08), 0 2px 6px rgba(22, 34, 63, 0.04)",
        soft:
          "0 1px 3px rgba(22, 34, 63, 0.06), 0 4px 12px rgba(22, 34, 63, 0.04)",
        // Sombras con tinte cálido para CTAs amarillos
        cta:
          "0 4px 14px rgba(235, 157, 8, 0.35), 0 1px 3px rgba(235, 157, 8, 0.15)",
        "cta-hover":
          "0 8px 22px rgba(235, 157, 8, 0.45), 0 2px 6px rgba(235, 157, 8, 0.2)",
        // Inner glow para badges
        "inner-soft": "inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.5" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
