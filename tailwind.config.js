/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.75rem", "1.125rem"]
      },
      colors: {
        primary: {
          25: "#F5FEFF",
          50: "#ECFDFF",
          100: "#CFF9FE",
          200: "#A5F0FC",
          300: "#67E3F9",
          400: "#22CCEE",
          500: "#06AED4",
          600: "#088AB2",
          700: "#0E7090",
          800: "#155B75",
          900: "#164C63"
        }
      },
      animation: {
        speaking: "speaking 0.5s infinite cubic-bezier(.36, .11, .89, .32) alternate",
        zoomIn: "zoomIn 0.2s ease-in forwards"
      }
    }
  },
  plugins: []
};
