/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        page: "#000000",
        surface: "#0A0A0A",
        text: "#F9FAFB",
        muted: "#9CA3AF",
        primary: "#FFFFFF",
        ok: "#D1D5DB",
        warn: "#F59E0B",
        border: "rgba(255,255,255,0.12)"
      },
      borderRadius: {
        xl: "1.25rem",
        lg: "1rem"
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.28)",
        pop: "0 12px 40px rgba(0,0,0,0.38)"
      }
    },
  },
  plugins: [],
}
