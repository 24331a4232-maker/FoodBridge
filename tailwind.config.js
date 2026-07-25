/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: Pine Green — trust, nature, depth
        primary: {
          50: '#E8F0EA',
          100: '#D1E2D5',
          200: '#A8C5B0',
          300: '#7FA88A',
          400: '#74A57F', // Moss Green (secondary)
          500: '#4F8060',
          600: '#3A6249',
          700: '#1B4332', // Pine Green (primary)
          800: '#163628',
          900: '#112A20',
          950: '#0A1A14',
        },
        // Accent: Mocha Brown — primary buttons, warmth, CTAs
        accent: {
          50: '#F5EDE6',
          100: '#EBD9CC',
          200: '#D6B399',
          300: '#C18D66',
          400: '#AC774F',
          500: '#8B5E3C', // Mocha Brown (primary button)
          600: '#724B30',
          700: '#5A3A26',
          800: '#42291B',
          900: '#2B1B12',
          950: '#160D09',
        },
        // Gold — certificate seals, premium accents
        gold: {
          50: '#FBF6EC',
          100: '#F5EBD3',
          200: '#EBD7A7',
          300: '#E0C37B',
          400: '#D5AF4F',
          500: '#C9A66B', // Accent Gold
          600: '#A8854A',
          700: '#876A3A',
          800: '#66502C',
          900: '#44361D',
          950: '#221B0E',
        },
        // Neutral surfaces — warm cream, soft beige, warm borders
        cream: '#FFF9F3', // Background
        oat: '#F6F1E9', // Secondary Background
        mist: '#F6F1E9',
        linen: '#E8DDD0', // Borders
        ink: '#2F241F', // Primary Text
        'ink-soft': '#6B7280', // Secondary Text
        // Secondary: Moss-to-Pine ramp — headers, footer, dashboard depth
        secondary: {
          50: '#E8F0EA',
          100: '#D1E2D5',
          200: '#A8C5B0',
          300: '#7FA88A',
          400: '#74A57F',
          500: '#4F8060',
          600: '#3A6249',
          700: '#1B4332',
          800: '#163628',
          900: '#112A20',
          950: '#0A1A14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        stat: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl-premium': '20px',
        '2xl-premium': '24px',
        '3xl-premium': '28px',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(47, 36, 31, 0.06), 0 4px 16px -4px rgba(47, 36, 31, 0.04)',
        'premium': '0 4px 24px -6px rgba(47, 36, 31, 0.08), 0 8px 32px -8px rgba(47, 36, 31, 0.06)',
        'premium-lg': '0 8px 40px -8px rgba(47, 36, 31, 0.12), 0 16px 48px -12px rgba(47, 36, 31, 0.08)',
        'glow-green': '0 8px 32px -8px rgba(27, 67, 50, 0.35)',
        'glow-orange': '0 8px 32px -8px rgba(139, 94, 60, 0.35)',
        'glow-gold': '0 8px 32px -8px rgba(201, 166, 107, 0.40)',
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
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
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
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231B4332' fill-opacity='0.04'%3E%3Cpath d='M0 0h1v1H0zM20 20h1v1h-1zM10 30h1v1H-1zM30 10h1v1H-1z'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
