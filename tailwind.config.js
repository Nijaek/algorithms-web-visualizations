/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0b0f1a",
        neon: {
          pink: "#ff2d95",
          cyan: "#2de2e6",
          yellow: "#f8d210",
          green: "#3df29b"
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"],
        mono: ["'Fira Code'", "ui-monospace", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};
