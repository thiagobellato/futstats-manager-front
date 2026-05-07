/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0a0b',
          card: '#161618',
          border: '#27272a',
          primary: '#22c55e',
          neon: '#adff2f',
          muted: '#a1a1aa',
        },
        primaryPurple: '#6B21A8', // Keeping legacy for now during transition
        primaryGreen: '#10B981',  // Keeping legacy for now during transition
      },
    },
  },
  plugins: [],
}
