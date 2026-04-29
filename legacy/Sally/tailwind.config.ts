import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter-tight)", "Inter Tight", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        display: ["var(--font-inter-tight)", "Inter Tight", "system-ui", "sans-serif"],
      },
      colors: {
        heritage: {
          50: "#faf8f5",
          100: "#f3eee6",
          200: "#e6dccd",
          300: "#d4c4ad",
          400: "#bda588",
          500: "#a88b6d",
          600: "#997862",
          700: "#7f6252",
          800: "#695246",
          900: "#57453c",
        },
        limbic: {
          trust: "#4a7c59",
          warmth: "#c4724a",
          arousal: "#7c4a6e",
          valence: "#4a6e7c",
        },
        peacock: {
          DEFAULT: "#00A896",
          primary: "#6A5ACD",
          secondary: "#4B0082",
          accent: "#9370DB",
        },
        leopard: {
          DEFAULT: "#C69C6D",
          primary: "#FF8C00",
          accent: "#FFD700",
        },
        genesis: {
          obsidian: "#0a0a0f",
          leopard: "#1e140a",
          peacock: "#051419",
          celestial: "#151020",
          void: "#050505",
        },
        sallie: {
          accent: "#00A896",
          gold: "#FFD700",
          iridescent: "#2D5A4A",
        },
        louisiana: {
          amber: "#D4A574",
          gold: "#FFD700",
          warmth: "#C4724A",
          sunset: "#FF6B35",
          moss: "#4A7C59",
          bayou: "#2D5A4A",
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "breath": "breath 4s ease-in-out infinite",
        "peacock-shimmer": "peacock-shimmer 4s ease-in-out infinite",
        "warm-glow": "warm-glow 3s ease-in-out infinite",
        "leopard-drift": "leopard-drift 20s linear infinite",
        "focus-pulse": "focus-pulse 2s ease-in-out infinite",
        "bayou-ambient": "bayou-ambient 6s ease-in-out infinite",
        "infj-fade": "infj-fade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "gentle-float": "gentle-float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        breath: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        "peacock-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "warm-glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(212, 165, 116, 0.15), 0 0 30px rgba(255, 215, 0, 0.05)" },
          "50%": { boxShadow: "0 0 25px rgba(212, 165, 116, 0.25), 0 0 50px rgba(255, 215, 0, 0.1)" },
        },
        "leopard-drift": {
          "0%": { backgroundPosition: "0 0, 30px 30px, 15px 15px" },
          "100%": { backgroundPosition: "60px 60px, 90px 90px, 75px 75px" },
        },
        "focus-pulse": {
          "0%, 100%": { borderColor: "rgba(0, 168, 150, 0.3)" },
          "50%": { borderColor: "rgba(0, 168, 150, 0.6)" },
        },
        "bayou-ambient": {
          "0%, 100%": { opacity: "0.3" },
          "33%": { opacity: "0.5" },
          "66%": { opacity: "0.4" },
        },
        "infj-fade": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
