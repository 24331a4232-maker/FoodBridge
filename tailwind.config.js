/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: vibrant green — growth, sustainability, trust
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16',
        },
        // Accent: warm orange — generosity, warmth, energy
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // Warm neutral surfaces — cream, oat, linen
        cream: '#FFFDF8',
        oat: '#F7F3EC',
        linen: '#EAE3D6',
        ink: '#1F2937',
        'ink-soft': '#6B7280',
        // Secondary kept for dark-mode surfaces (deep forest)
        secondary: {
          50: '#F0F6F2',
          100: '#DCEAE0',
          200: '#BCD5C4',
          300: '#92BBA0',
          400: '#649B79',
          500: '#437E5C',
          600: '#316448',
          700: '#27513A',
          800: '#1F4030',
          900: '#15291F',
          950: '#0A1610',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        stat: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl-premium': '18px',
        '2xl-premium': '22px',
        '3xl-premium': '28px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(31, 41, 55, 0.06), 0 4px 16px -4px rgba(31, 41, 55, 0.04)',
        'premium': '0 4px 24px -6px rgba(31, 41, 55, 0.08), 0 8px 32px -8px rgba(31, 41, 55, 0.06)',
        'premium-lg': '0 8px 40px -8px rgba(31, 41, 55, 0.12), 0 16px 48px -12px rgba(31, 41, 55, 0.08)',
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
        'fade-up': 'fadeUp 0.7s ease-out forwards',
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
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316A34A' fill-opacity='0.04'%3E%3Cpath d='M0 0h1v1H0zM20 20h1v1h-1zM10 30h1v1h-1zM30 10h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
