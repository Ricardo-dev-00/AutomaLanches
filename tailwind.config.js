/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        secondary: '#128C7E',
        background: '#FFFFFF',
        card: '#F1F8F5',
        textPrimary: '#1E1E1E',
        textSecondary: '#5F6368',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
