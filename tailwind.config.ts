import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Lato', 'sans-serif'],
      },
      colors: {
        primary: '#d4816f',
        secondary: '#f5f1ed',
      },
    },
  },
  plugins: [],
} satisfies Config;