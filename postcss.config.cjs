// postcss.config.cjs
const tailwindcss = require('tailwindcss');
// If you're using the new package: const tailwindcss = require('@tailwindcss/postcss');

module.exports = {
  plugins: [
    tailwindcss,
    // other plugins...
  ]
};