/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: Teal — trust, calm, professionalism
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
        // Accent: Soft Copper — warmth, CTAs, recognition
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#631C08',
          950: '#431407',
        },
        // Bronze — certificate seals, subtle warmth
        gold: {
          50: '#FBF7F2',
          100: '#F5E9DA',
          200: '#E8CDB0',
          300: '#D9AC84',
          400: '#C68B5A',
          500: '#A66B3C',
          600: '#8A522B',
          700: '#6E3F20',
          800: '#523018',
          900: '#3A2110',
          950: '#1F1208',
        },
        // Neutral surfaces — white, slate, border
        cream: '#FFFFFF',
        oat: '#F1F5F9',
        mist: '#F8FAFC',
        linen: '#E5E7EB',
        ink: '#1F2937',
        'ink-soft': '#6B7280',
        // Secondary: Navy — headers, footer, dashboard depth
        secondary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
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
        'glow-green': '0 8px 32px -8px rgba(15, 118, 110, 0.35)',
        'glow-orange': '0 8px 32px -8px rgba(194, 65, 12, 0.35)',
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
