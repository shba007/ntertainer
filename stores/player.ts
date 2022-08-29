import { defineStore } from 'pinia';
import { useNow } from '@vueuse/core'
import { Seek } from '~/utils/models';

const now = useNow()

export const usePlayer = defineStore('player', {
	state: () => ({
		episode: null,
		buffer: null,
		playback: null,
		playbackRate: null,
		seekTime: null,
		timeStamp: null
	}),
	getters: {
		seek: (state) => state.seekTime + (now.value.getTime() / 1000 - state.timeStamp) * Number(state.playback == "play"),
		seekStamp: (state) => ({ time: state.seekTime, timestamp: state.timeStamp })
	},
	actions: {
		init(episode: number, buffer: "load" | "empty", playback: "play" | "pause", playbackRate: number, seek: Seek) {
			this.episode = episode
			this.buffer = buffer
			this.playback = playback
			this.playbackRate = playbackRate
			this.setSeek(seek)
		},
		setSeek(seek: number | Seek) {
			if (typeof seek === "number") {
				this.seekTime = seek
				this.timeStamp = now.value.getTime() / 1000
			} else {
				this.seekTime = seek.time
				this.timeStamp = seek.timestamp
			}
		}
	}
})