/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
	content: [],
	theme: {
		extend: {
			fontFamily: {
				'head': ['League Spartan', ...defaultTheme.fontFamily.sans],
				'body': ['Poppins', ...defaultTheme.fontFamily.sans],
				'mono': ['CrashNumberingSerif', ...defaultTheme.fontFamily.mono]
			},
			screens: {
				'mobile': { 'raw': '(pointer:coarse)' },
				'pc': { 'raw': '(pointer:fine)' },
				'portrait': { 'raw': '(orientation: portrait)' },
				'landscape': { 'raw': '(orientation: landscape)' },
			}
		},
	},
	plugins: [],
}
