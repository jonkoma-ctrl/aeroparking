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
        // Azul corporativo — identidad principal
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Acento amarillo primario — CTAs y highlights vibrantes
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
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
          "0 1px 2px rgba(30, 58, 138, 0.04), 0 8px 24px rgba(30, 58, 138, 0.08), 0 2px 6px rgba(30, 58, 138, 0.04)",
        soft:
          "0 1px 3px rgba(30, 58, 138, 0.06), 0 4px 12px rgba(30, 58, 138, 0.04)",
        // Sombras con tinte cálido para CTAs amarillos
        cta:
          "0 4px 14px rgba(245, 158, 11, 0.35), 0 1px 3px rgba(245, 158, 11, 0.15)",
        "cta-hover":
          "0 8px 22px rgba(245, 158, 11, 0.45), 0 2px 6px rgba(245, 158, 11, 0.2)",
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
