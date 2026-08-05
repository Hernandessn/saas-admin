/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14181B",
          soft: "#1E2427",
          muted: "#3A4247",
        },
        paper: {
          DEFAULT: "#F7F5F0",
          dim: "#EFECE4",
        },
        brand: {
          50: "#EAF3F4",
          100: "#CFE4E7",
          200: "#9FC9CF",
          300: "#6FAEB7",
          400: "#3F939F",
          500: "#0F4C5C",
          600: "#0D4451",
          700: "#0A3641",
          800: "#082C36",
          900: "#061F27",
        },
        volt: {
          DEFAULT: "#C4F135",
          soft: "#DAF77A",
          deep: "#9FC71F",
        },
        status: {
          lead: "#B98900",
          active: "#1E8E5A",
          paused: "#6B7280",
          churned: "#C0392B",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xl2: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 24, 27, 0.04), 0 8px 24px -12px rgba(20, 24, 27, 0.18)",
        "card-dark": "0 1px 2px rgba(0, 0, 0, 0.3), 0 8px 24px -12px rgba(0, 0, 0, 0.5)",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.97)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "scale-in": "scale-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};
