import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0b0f1a",
        surface: {
          0: "#05070f",
          1: "#0b1020",
          2: "#0c1224",
          3: "#111833",
        },
        neon: {
          pink: "#ff2d95",
          cyan: "#2de2e6",
          yellow: "#f8d210",
          green: "#3df29b",
        },
        accent: {
          fuchsia: "#d946ef",
          cyan: "#22d3ee",
          green: "#34d399",
          purple: "#a78bfa",
          amber: "#fbbf24",
        },
      },
      fontFamily: {
        display: [
          "var(--font-space-grotesk)",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-fira-code)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        glow: "0 0 20px -5px var(--tw-shadow-color)",
        "glow-lg": "0 0 40px -10px var(--tw-shadow-color)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
