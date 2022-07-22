<script setup lang="ts">
import { useUser } from '../../stores/user';

const user = useUser()
const { $callSocket } = useNuxtApp()

const emits = defineEmits<{
	(event: "update:pinStream", local: boolean, stream: MediaStream): void
}>()
const socket = $callSocket()

const remoteStreams = ref<Map<string, MediaStream>>(new Map())
const streams = computed(() => [user.stream, ...Array.from(remoteStreams.value, ([id, stream]) => (stream))])

const pinStreamIndex = ref(0)

const rtcConfig: RTCConfiguration = {
	iceServers: [{
		urls: [
			"stun:stun.l.google.com:19302",
			"stun:stun1.l.google.com:19302",
			"stun:stun2.l.google.com:19302",
			"stun:stun3.l.google.com:19302",
			"stun:stun4.l.google.com:19302",
		]
	}]
}
const connectionId = ref<string>(null)
const connection = ref<RTCPeerConnection>(null)

watch(streams, (newStreams) => {
	emits("update:pinStream", pinStreamIndex.value === 0, newStreams[pinStreamIndex.value])
})

// WebRTC Life Cycle Hooks
watch(() => user.stream, async (stream) => {
	console.log("Get Media");
	await createOffer()
});

function createConnection() {
	connection.value = new RTCPeerConnection(rtcConfig)
	console.log("Peer Connection Created");

	if (user.stream) {
		user.stream.getTracks().forEach(track => {
			connection.value.addTrack(track)
		})
	}

	connection.value.onicecandidate = (event) => {
		if (event.candidate) {
			console.log("New ICE Candidate");
			socket.emit("candidate", event.candidate)
		}
	}

	connection.value.ontrack = (event) => {
		console.log("New Track added", event.track);
		const remoteStream = remoteStreams.value.get(connectionId.value)
		remoteStream.addTrack(event.track)
	}
}

async function createOffer() {
	createConnection()

	const offer = await connection.value.createOffer()
	await connection.value.setLocalDescription(offer)
	console.log("Offer Created:", offer);

	// console.log("local", connection.value.localDescription);
	// console.log("remote", connection.value.remoteDescription);

	socket.emit("offer", offer)
}

async function createAnswer(id: string, offer: RTCSessionDescriptionInit) {
	connectionId.value = id

	createConnection()
	remoteStreams.value.set(id, new MediaStream())
	await connection.value.setRemoteDescription(offer)
	console.log("Offer Set:", offer);

	const answer = await connection.value.createAnswer()
	await connection.value.setLocalDescription(answer)
	console.log("Answer Created:", answer);

	// console.log("local", connection.value.localDescription);
	// console.log("remote", connection.value.remoteDescription);

	socket.emit("answer", answer)
}

async function addAnswer(id: string, answer: RTCSessionDescriptionInit) {
	connectionId.value = id

	remoteStreams.value.set(id, new MediaStream())
	await connection.value.setRemoteDescription(answer)
	console.log("Answer Set:", answer);

	// console.log("local", connection.value.localDescription);
	// console.log("remote", connection.value.remoteDescription);
}

async function removeConnection(id: string) {
	console.log("Peer Connection removed");
	remoteStreams.value.delete(id)
}

async function onGetICECandidate(id: string, candidate: RTCIceCandidateInit) {
	console.log("On Receive new Candidate");
	await connection.value.addIceCandidate(candidate)
}

onMounted(async () => {
	user.toggleStreaming(true)

	/* setTimeout(() => toggleDevices(true, false), 5000)
	setTimeout(() => toggleDevices(false, false), 15000)
	setTimeout(() => toggleDevices(false, true), 25000)
	setTimeout(() => toggleDevices(true, true), 35000) */

	socket.on("offer", createAnswer)
	socket.on("answer", addAnswer)
	socket.on("candidate", onGetICECandidate)
	socket.on("remove", removeConnection)
})

onBeforeUnmount(() => {
	// user.toggleStreaming(false)

	socket.off("call", createAnswer)
	socket.off("receive", addAnswer)
	socket.off("candidate", onGetICECandidate)
	socket.off("remove", removeConnection)

	socket.disconnect()
	if (connection.value)
		connection.value.close()
})
</script>

<template>
	<ul class="grid grid-cols-2 md:grid-cols-1 gap-2">
		<li v-for="(stream, index) in streams">
			<CallCard :local="index === 0" :audio="true" :video="true" :stream="stream" class="shrink-0"
				@click="emits('update:pinStream', index === 0, stream)" />
		</li>
	</ul>
</template>

<style scoped>
:root {
	-ms-overflow-style: none;
	scrollbar-width: none;
}

:root::-webkit-scrollbar {
	display: none;
}
</style>