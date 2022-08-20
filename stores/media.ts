import { defineStore } from "pinia"

export const useMedia = defineStore('media', {
	state: () => ({
		type: null,
		id: null,
		episodes: null,
		title: null
	}),
	getters: {
		totalEpisodes: (state) => state.episodes.length
	},
	actions: {
		init(type: string, id: string) {
			this.type = type
			this.id = id
		},
	}
})