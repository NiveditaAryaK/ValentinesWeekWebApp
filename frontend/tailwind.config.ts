import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        cream: "#f7f4ef",
        rose: {
          50: "#fbf2f4",
          100: "#f7e5ea",
          200: "#efcbd6",
          300: "#e2a3b3",
          400: "#d1788c",
          500: "#b84d66",
          600: "#9c2f4c",
          700: "#7f213c",
          800: "#5f1a2f",
          900: "#3f101f"
        },
        ink: {
          700: "#2f2a2c",
          800: "#231f21",
          900: "#1b1719"
        }
      },
      fontFamily: {
        serif: ["\"Playfair Display\"", "serif"],
        sans: ["\"Work Sans\"", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 40px rgba(36, 22, 26, 0.12)",
        card: "0 8px 24px rgba(43, 30, 34, 0.12)"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 700ms ease-out both"
      }
    }
  },
  plugins: []
} satisfies Config;
