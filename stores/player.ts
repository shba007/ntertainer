import { defineStore } from 'pinia';

export const usePlayer = defineStore('player', {
	state: () => ({
		episode: null,
		buffer: null,
		playback: null,
		playbackRate: null,
		seek: null
	}),
	actions: {
		init(episode: number, buffer: "load" | "empty", playback: "play" | "pause", playbackRate: number, seek: number) {
			this.episode = episode
			this.buffer = buffer
			this.playback = playback
			this.playbackRate = playbackRate
			this.seek = seek
		},
	}
})