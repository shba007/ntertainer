import { defineStore } from 'pinia'


export const useMedia = defineStore('media', {
	state: () => {
		return {
			type: null,
			id: null,
			title: null,
			episode: {
				current: null,
				total: null
			}
		}
	},
	actions: {
		init(type: string, id: string, title: string, episode: { current: number, total: number }) {
			this.type = type
			this.id = id
			this.title = title
			this.episode = episode
		}
	}
})