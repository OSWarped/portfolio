// postcss.config.cjs  – root folder
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},   // Tailwind 4 bridge
    autoprefixer: {},             // (optional) keep if you want it
  },
};
