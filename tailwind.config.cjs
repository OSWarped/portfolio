/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cardinal:      '#C41E3A',
        'cardinal-700': '#9A1429',
        navy:          '#000080',
        'navy-50':     '#E8E8F8',
      },
    },
  },
};