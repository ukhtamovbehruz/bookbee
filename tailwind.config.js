/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest': '#1A7A4A',
        'honey': '#F5C842',
        'sky': '#2E7DD1',
        'midnight': '#0D1B2A',
        'parchment': '#F5F7F2',
        'lavender': '#A29BFE',
        'teal': '#48DBBB',
        'coral': '#FF6B6B',
        'amber': '#FF9F43',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-fast': 'marquee 15s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
