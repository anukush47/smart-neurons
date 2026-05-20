import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50:  "#fff5f5",
          100: "#ffe0e0",
          200: "#ffbdbd",
          300: "#ff9494",
          400: "#ff7b7b",
          500: "#FF6B6B",
          600: "#ff5252",
          700: "#e63946",
          800: "#c1121f",
          900: "#9d0208",
        },
        sunshine: {
          50:  "#fffde7",
          100: "#fff9c4",
          300: "#fff176",
          400: "#FFD93D",
          500: "#ffc300",
          600: "#ffb300",
        },
        sage: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          300: "#86efac",
          400: "#6BCB77",
          500: "#4CAF50",
          600: "#16a34a",
        },
        warm: {
          50:  "#FDFAF7",
          100: "#F8F4F0",
          200: "#f0e9e0",
          300: "#e8ddd0",
        },
        navy: "#1A1A2E",
        "navy-light": "#16213E",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body:    ["var(--font-inter)", "system-ui", "sans-serif"],
        fun:     ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      boxShadow: {
        glass:      "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
        "glass-lg": "0 16px 48px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
        "glass-xl": "0 24px 64px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        coral:      "0 8px 32px rgba(255, 107, 107, 0.3)",
        "coral-lg": "0 16px 48px rgba(255, 107, 107, 0.4)",
        card:       "0 4px 24px rgba(26, 26, 46, 0.08)",
        "card-hover":"0 12px 40px rgba(26, 26, 46, 0.14)",
      },
      animation: {
        "float":         "float 6s ease-in-out infinite",
        "float-delay":   "floatDelayed 6s ease-in-out 2s infinite",
        "float-slow":    "float 8s ease-in-out 1s infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "fade-up":       "fadeUp 0.7s ease-out both",
        "scale-in":      "scaleIn 0.5s ease-out both",
        "slide-in-left": "slideInLeft 0.7s ease-out both",
        "pulse-soft":    "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-16px)" },
        },
        floatDelayed: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.7" },
        },
      },
      backgroundImage: {
        "gradient-radial":   "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":     "linear-gradient(135deg, #FFF5F5 0%, #FFF9F0 30%, #F0FDF4 60%, #F8F4F0 100%)",
        "coral-gradient":    "linear-gradient(135deg, #FF6B6B 0%, #ff8e53 100%)",
        "sunshine-gradient": "linear-gradient(135deg, #FFD93D 0%, #FFB347 100%)",
        "sage-gradient":     "linear-gradient(135deg, #6BCB77 0%, #4CAF50 100%)",
        "glass-shimmer":     "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
