<script setup lang="ts">
import { useUser } from '../stores/user';

const user = useUser()

const { audioOutputs: speakers, audioInputs: microphones, videoInputs: cameras } = useDevicesList({
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
	onUpdated() {
		if (!speakers.value.find(i => i.deviceId === user.currentSpeakerId))
			user.setSpeaker(speakers.value[0]?.deviceId)

		if (!microphones.value.find(i => i.deviceId === user.currentMicrophoneId))
			user.setMicrophone(microphones.value[0]?.deviceId)

		if (!cameras.value.find(i => i.deviceId === user.currentCameraId))
			user.setCamera(cameras.value[0]?.deviceId)
	},
})
</script>

<template>
	<div class="flex flex-col gap-4 justify-center items-center min-w-[100vw] min-h-[100vh]">
		<NuxtLink to="/watch" class="px-4 py-2 rounded-full text-white bg-blue-500 ">
			Join Room
		</NuxtLink>
		<div class="flex gap-2">
			<ul>
				<li class="text-center">Speaker</li>
				<li v-for="audioOutput in speakers"
					:class="{ 'text-blue-500': user.currentSpeakerId === audioOutput.deviceId }"
					@click="user.setSpeaker(audioOutput.deviceId)">
					{{ audioOutput.label }}
				</li>
			</ul>
			<ul>
				<li class="text-center">Microphone</li>
				<li v-for="audioInput in microphones"
					:class="{ 'text-blue-500': user.currentMicrophoneId === audioInput.deviceId }"
					@click="user.setMicrophone(audioInput.deviceId)">
					{{ audioInput.label }}
				</li>
			</ul>
			<ul>
				<li class="text-center">Camera</li>
				<li v-for="videoInput in cameras"
					:class="{ 'text-blue-500': user.currentCameraId === videoInput.deviceId }"
					@click="user.setCamera(videoInput.deviceId)">
					{{ videoInput.label }}
				</li>
			</ul>
		</div>
	</div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500&family=League+Spartan:wght@300;400;500&family=Poppins:wght@300;400;500;700&display=swap");

* {
	@apply font-body;
	-webkit-tap-highlight-color: transparent;
}

.nuxt-icon svg {
	margin: 0 !important;
}
</style>