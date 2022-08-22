import { defineStore } from "pinia"

const { audioInputs: microphones, videoInputs: cameras } = useDevicesList({
	requestPermissions: true,
	constraints: {
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
		},
		video: {
			width: { min: 640, ideal: 800, max: 854 },
			height: { min: 360, ideal: 450, max: 480 }
		}
	},
})
const { audioDeviceId, videoDeviceId, enabled, stream } = useUserMedia({ enabled: false })

export const useUser = defineStore('user', {
	state: () => ({
		$microphone: { state: true, id: microphones.value[0]?.deviceId, label: microphones.value[0]?.label },
		$camera: { state: true, id: cameras.value[0]?.deviceId, label: microphones.value[0]?.label },
	}),
	getters: {
		audio: (state) => state.$microphone.state,
		video: (state) => state.$camera.state,
		microphones: () => microphones.value.reduce((microphones, microphone) => ([...microphones, { id: microphone.deviceId, label: microphone.label }]), []),
		cameras: () => cameras.value.reduce((cameras, camera) => ([...cameras, { id: camera.deviceId, label: camera.label }]), []),
		currentMicrophone: (state) => (!state.$microphone.state ? { id: false } : { id: state.$microphone.id, label: state.$microphone.label }),
		currentCamera: (state) => (!state.$camera.state ? { id: false } : { id: state.$camera.id, label: state.$camera.label }),
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
		setMicrophone(microphone: { id: string, label: string }) {
			this.$microphone.id = audioDeviceId.value = microphone.id
			this.$microphone.label = microphone.label
		},
		setCamera(camera: { id: string, label: string }) {
			this.$camera.id = videoDeviceId.value = camera.id
			this.$camera.label = camera.label
		},
		enableStreaming() {
			enabled.value = true
		},
		disableStreaming() {
			enabled.value = false
		},
		$updateStream() {
			console.debug("Audio/Video Stream Updated");
			enabled.value = this.audio || this.video

			if (enabled.value) {
				audioDeviceId.value = this.currentMicrophone.id
				videoDeviceId.value = this.currentCamera.id
			} else {
				audioDeviceId.value = false
				videoDeviceId.value = false
			}
		}
	}
})