/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: warm terracotta — earthy, humanitarian, warm
        primary: {
          50: '#FBF3EC',
          100: '#F6E1D2',
          200: '#EBC4A8',
          300: '#DDA37B',
          400: '#D08550',
          500: '#C26A35',
          600: '#A85327',
          700: '#843E1F',
          800: '#5F2D18',
          900: '#3D1E10',
          950: '#1F0F08',
        },
        // Secondary: deep forest green — growth, trust, nourishment
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
        // Accent: warm amber — warmth, grain, generosity
        accent: {
          50: '#FEF7E9',
          100: '#FCEBC4',
          200: '#F9D88A',
          300: '#F5C253',
          400: '#F0A82E',
          500: '#E28A1B',
          600: '#BE6E13',
          700: '#985410',
          800: '#733E11',
          900: '#4D2A0D',
          950: '#291606',
        },
        // Warm neutral surfaces — cream, oat, linen
        cream: '#FAF6F0',
        oat: '#F2EBE0',
        linen: '#E8DFD2',
        ink: '#2B231D',
        'ink-soft': '#5C5048',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        stat: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl-premium': '18px',
        '2xl-premium': '22px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(43, 35, 29, 0.06), 0 4px 16px -4px rgba(43, 35, 29, 0.04)',
        'premium': '0 4px 24px -6px rgba(43, 35, 29, 0.08), 0 8px 32px -8px rgba(43, 35, 29, 0.06)',
        'premium-lg': '0 8px 40px -8px rgba(43, 35, 29, 0.12), 0 16px 48px -12px rgba(43, 35, 29, 0.08)',
        'glow-green': '0 8px 32px -8px rgba(67, 126, 92, 0.35)',
        'glow-orange': '0 8px 32px -8px rgba(194, 106, 53, 0.35)',
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
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23843E1F' fill-opacity='0.04'%3E%3Cpath d='M0 0h1v1H0zM20 20h1v1h-1zM10 30h1v1H-1zM30 10h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
