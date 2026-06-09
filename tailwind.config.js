/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#0f0f13',
          700: '#13131a',
          600: '#1a1a26',
          500: '#22223a',
        },
        brand: {
          orange: '#f97316',
          yellow: '#eab308',
        },
      },
    },
  },
  plugins: [],
}
