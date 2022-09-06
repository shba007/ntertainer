import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	modules: [
		"@nuxtjs/tailwindcss",
		"@vueuse/nuxt",
		"nuxt-icons",
		"@pinia/nuxt",
		"@kevinmarrec/nuxt-pwa",
	],
	runtimeConfig: {
		public: {
			apiURL: process.env.API_BASE_URL,
		},
	},
	pwa: {
		manifest: {
			name: "Ntertainer",
			short_name: "Ntertainer",
			background_color: "#181A20",
			theme_color: "#0EA5E9",
		},
		meta: {
			name: "Ntertainer",
			author: "Shirsendu Bairagi",
			description: "Entertainment with your friends",
			mobileAppIOS: true,
			ogHost: "https://ntertainer.netlify.app",
			twitterCard: "summary",
		},
		workbox: {
			enabled: true,
		},
	},
});
