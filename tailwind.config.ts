import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: {
            DEFAULT: "#008e97",
            hover: "#00777f",
            dark: "#005e64",
            light: "#e6f6f7",
            border: "#b2e4e8",
          },
          orange: {
            DEFAULT: "#f58220",
            hover: "#df6f11",
            dark: "#c35a00",
            light: "#fff4ea",
            border: "#ffd8b2",
          },
          red: {
            DEFAULT: "#df0000",
            hover: "#be0000",
            light: "#fdf2f2",
            border: "#fecaca",
          },
          dark: "#0b1320",
          slate: "#1e293b",
          light: "#f8fafc",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          '"Plus Jakarta Sans"',
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      boxShadow: {
        "tech-cyan": "0 0 25px -5px rgba(0, 142, 151, 0.35)",
        "tech-orange": "0 0 25px -5px rgba(245, 130, 32, 0.4)",
        "tech-card": "0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 20px 40px -10px rgba(15, 23, 42, 0.16), 0 8px 16px -4px rgba(15, 23, 42, 0.06)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "tech-grid":
          "linear-gradient(to right, rgba(0, 142, 151, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 142, 151, 0.05) 1px, transparent 1px)",
        "tech-grid-dark":
          "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
