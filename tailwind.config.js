/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bluely: {
          50: '#e6f0fa',
          500: '#0284c7',
          600: '#02689c',
          700: '#034f75'
        }
      }
    },
  },
  plugins: [],
}