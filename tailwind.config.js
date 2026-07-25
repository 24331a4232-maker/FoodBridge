/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        ivory: '#FFFDF8',
        'light-gray': '#F8FAFC',
        'dark-text': '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        stat: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl-premium': '18px',
        '2xl-premium': '22px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(16, 163, 74, 0.06), 0 4px 16px -4px rgba(0, 0, 0, 0.04)',
        'premium': '0 4px 24px -6px rgba(16, 163, 74, 0.08), 0 8px 32px -8px rgba(0, 0, 0, 0.06)',
        'premium-lg': '0 8px 40px -8px rgba(16, 163, 74, 0.12), 0 16px 48px -12px rgba(0, 0, 0, 0.08)',
        'glow-green': '0 8px 32px -8px rgba(22, 163, 74, 0.35)',
        'glow-orange': '0 8px 32px -8px rgba(249, 115, 22, 0.35)',
        'inner-soft': 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'ripple': 'ripple 0.6s linear',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        shimmer: {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316a34a' fill-opacity='0.05'%3E%3Cpath d='M0 0h1v1H0zM20 20h1v1h-1zM10 30h1v1h-1zM30 10h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
