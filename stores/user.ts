import { defineStore } from 'pinia'

export const useUser = defineStore('user', {
	state: () => ({
		audio: true,
		video: true,
	}),
	actions: {
		toggleAudio() {
			this.audio = !this.audio
		},
		toggleVideo() {
			this.video = !this.video
		},
	}
})