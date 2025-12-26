/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./views/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          bg: '#121212',
          surface: '#1E1E1E',
          'text-primary': '#E0E0E0',
          'text-secondary': '#A0A0A0',
          self: '#6366f1',
          relationships: '#e17055',
          home: '#84a98c',
          dashboard: '#2d3436'
        }
      }
    }
  },
  plugins: []
}
