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
		init(type: string, id: string) {
			this.type = type
			this.id = id
		}
	}
})