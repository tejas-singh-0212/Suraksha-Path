/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
     colors: {
  safe: '#10b981',    // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444',  // red-500
  primary: '#10b981'  // Making primary the safe color
}
    },
  },
  plugins: [],
}
