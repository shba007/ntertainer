import { defineStore } from 'pinia'

// TODO: config
let config;

export const useMedia = defineStore('media', {
	state: () => {
		config = useRuntimeConfig()

		return {
			type: null,
			id: null,
			title: null,
			episode: null
		}
	},
	getters: {
		poster: (state) => `${config.public.apiURL}/public/${state.type}/${state.id}/Landscape.jpg`,
		src: (state) => `${config.public.apiURL}/public/${state.type}/${state.id}/${state.episode}/manifest.mpd`
	},
	actions: {
		init(type: string, id: string, title: string, episode: number) {
			this.type = type
			this.id = id
			this.title = title
			this.episode = episode
		},
		prev() {
			this.episode = this.episode - 1
		},
		next() {
			this.episode = this.episode + 1
		}
	}
})