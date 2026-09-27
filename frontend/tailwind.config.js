/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F2F4F0",
        surface: "#FFFFFF",
        surface2: "#EBEEE8",
        ink: "#1B2333",
        inksoft: "#535F58",
        primary: "#145C52",
        primarydark: "#0E4038",
        primarysoft: "#DCE9E4",
        accent: "#C98A2C",
        accentsoft: "#F1DDB0",
        slateasn: "#35586B",
        line: "#D8DCD3",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
