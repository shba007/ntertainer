import { defineStore } from 'pinia'

export const useUser = defineStore('user', {
	state: () => ({
		$speaker: { state: true, id: undefined },
		$microphone: { state: true, id: undefined },
		$camera: { state: true, id: undefined }
	}),
	getters: {
		audio: (state) => state.$microphone.state,
		video: (state) => state.$camera.state,
		currentSpeakerId: (state) => state.$speaker.state ? state.$speaker.id : false,
		currentMicrophoneId: (state) => state.$microphone.state ? state.$microphone.id : false,
		currentCameraId: (state) => state.$camera.state ? state.$camera.id : false
	},
	actions: {
		toggleMicrophone() {
			this.$microphone.state = !this.$microphone.state
		},
		toggleCamera() {
			this.$camera.state = !this.$camera.state
		},
		setSpeaker(deviceId: string | false) {
			this.$speaker.id = deviceId
		},
		setMicrophone(deviceId: string | false) {
			this.$microphone.id = deviceId
		},
		setCamera(deviceId: string | false) {
			this.$camera.id = deviceId
		}
	}
})