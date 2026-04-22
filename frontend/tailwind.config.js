/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#a855f7",
        danger: "#ef4444",
        safe: "#22c55e",
        warning: "#f59e0b",
      }
    },
  },
  plugins: [],
}
