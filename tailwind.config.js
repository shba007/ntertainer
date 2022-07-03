/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        'head': ['League Spartan', ...defaultTheme.fontFamily.sans],
        'body': ['Poppins', ...defaultTheme.fontFamily.sans],
        'mono': ['Crash Numbering', ...defaultTheme.fontFamily.mono]
      }
    },
  },
  plugins: [],
}
