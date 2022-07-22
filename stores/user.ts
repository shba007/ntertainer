import { defineStore } from 'pinia'

export const useUser = defineStore('user', {
	state: () => ({
		audio: false,
		video: false
	}),
	actions: {
		toggleAudio() {
			this.audio = !this.audio
		},
		toggleVideo() {
			this.audio = !this.audio
		}
	}
})