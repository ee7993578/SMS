/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      keyframes: {
        fadeSlideIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(99,102,241,0.8)' },
        },
      },
      animation: {
        'fade-slide-in': 'fadeSlideIn 0.28s ease',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      boxShadow: {
        '3d-light': '0 4px 0 rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)',
        '3d-dark':  '0 4px 0 rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.4)',
        'glow-blue': '0 0 0 1px rgba(59,130,246,0.3), 0 4px 16px rgba(59,130,246,0.25)',
        'glow-indigo': '0 0 0 1px rgba(99,102,241,0.3), 0 4px 20px rgba(99,102,241,0.3)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.12)',
      },
    },
  },
  plugins: [],
}
