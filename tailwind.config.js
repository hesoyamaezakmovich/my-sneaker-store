/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        '2xl': '1536px',
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      keyframes: {
        'rotate-cube': {
          '0%':   { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%, 100%': { opacity: '0.25' },
          '50%':      { opacity: '0.6' },
        },
      },
      animation: {
        'rotate-cube': 'rotate-cube 12s linear infinite',
        'fade-up':     'fade-up 0.6s ease-out both',
        'float':       'float 4s ease-in-out infinite',
        'glow':        'glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
