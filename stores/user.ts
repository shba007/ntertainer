import { defineStore } from 'pinia'

const { audioInputs, videoInputs } = useDevicesList({ requestPermissions: true })
const { audioDeviceId, videoDeviceId, enabled: streaming, stream } = useUserMedia()

export const useUser = defineStore('user', {
	state: () => ({
		audio: true,
		video: true,
		streaming: streaming,
		stream: stream,
	}),
	actions: {
		$refreshStream() {
			const currentAudioDeviceId = this.audio ? audioInputs.value[0]?.deviceId : false
			const currentVideoDeviceId = this.video ? videoInputs.value[0]?.deviceId : false

			streaming.value = !!(currentAudioDeviceId || currentVideoDeviceId)
			console.log("Stream", streaming.value)

			if (streaming.value) {
				audioDeviceId.value = currentAudioDeviceId
				videoDeviceId.value = currentVideoDeviceId
			}

			// console.log("Microphone", !!currentAudioDeviceId, "Camera", !!currentVideoDeviceId);
		},
		toggleAudio() {
			this.audio = !this.audio
			this.$refreshStream()
		},
		toggleVideo() {
			this.video = !this.video
			this.$refreshStream()
		},
		toggleStreaming(newStreaming = !streaming.value) {
			streaming.value = newStreaming
		}
	}
})