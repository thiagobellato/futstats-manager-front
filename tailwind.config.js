/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryPurple: '#6B21A8', // Roxo principal
        lightPurple: '#A855F7',   // Roxo claro
        darkPurple: '#4C1D95',    // Roxo escuro
        primaryGreen: '#10B981',  // Verde principal
        lightGreen: '#6EE7B7',    // Verde claro
        darkGreen: '#047857',     // Verde escuro
        // Novas cores para mensagem
        customError: '#dc2626',   // Vermelho para erro (red-600 equivalente)
        customSuccess: '#16a34a', // Verde para sucesso (green-600 equivalente)
      },
    },
  },
  plugins: [],
}
