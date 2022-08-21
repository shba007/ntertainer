import { defineStore } from "pinia"
const { audioDeviceId, videoDeviceId, enabled, stream } = useUserMedia({ enabled: true })

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
		currentCameraId: (state) => state.$camera.state ? state.$camera.id : false,
		stream: () => stream.value,
		streaming: () => enabled.value,
	},
	actions: {
		toggleMicrophone() {
			this.$microphone.state = !this.$microphone.state
			this.$updateStream()
		},
		toggleCamera() {
			this.$camera.state = !this.$camera.state
			this.$updateStream()
		},
		setSpeaker(deviceId: string | false) {
			this.$speaker.id = deviceId
		},
		setMicrophone(deviceId: string | false) {
			this.$microphone.id = deviceId
			audioDeviceId.value = deviceId
		},
		setCamera(deviceId: string | false) {
			this.$camera.id = deviceId
			videoDeviceId.value = deviceId
		},
		$updateStream() {
			console.debug("Audio/Video Stream Updated");
			enabled.value = this.audio || this.video

			if (enabled.value) {
				audioDeviceId.value = this.currentMicrophoneId
				videoDeviceId.value = this.currentCameraId
			} else {
				audioDeviceId.value = false
				videoDeviceId.value = false
			}
		}
	}
})