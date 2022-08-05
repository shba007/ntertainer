<script setup lang="ts">
import { useUser } from '../../stores/user';
import { Participant } from './Card.vue';

const { $callSocket } = useNuxtApp()
const user = useUser()

const emits = defineEmits<{
	(event: "update:pinParticipant", participant: Participant): void
}>()
const socket = $callSocket()

const { audioInputs, videoInputs } = useDevicesList({
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
	}
})
const { audioDeviceId, videoDeviceId, enabled: streaming, stream: localStream } = useUserMedia()
const remoteStreams = ref<Map<string, MediaStream>>(new Map())

const localParticipant = computed(() => ({
	id: "0",
	local: true,
	name: { first: "Participant 1", last: "" },
	audio: user.audio,
	video: user.video,
	stream: localStream.value
}))
const remoteParticipants = computed(() => (Array.from(remoteStreams.value, ([id, stream]) => ({
	id,
	local: false,
	name: { first: "Participant 2", last: "" },
	audio: true,
	video: true,
	stream
}))))

const participants = computed(() => [localParticipant.value, ...remoteParticipants.value])
const isInit = ref(false)

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

function refreshStream() {
	const currentAudioDeviceId = user.audio ? audioInputs.value[0].deviceId : false
	const currentVideoDeviceId = user.video ? videoInputs.value[0].deviceId : false

	streaming.value = !!(currentAudioDeviceId || currentVideoDeviceId)

	if (streaming.value) {
		audioDeviceId.value = currentAudioDeviceId
		videoDeviceId.value = currentVideoDeviceId
	}

	// console.log("Stream", streaming.value)
	// console.log("Microphone", !!currentAudioDeviceId, "Camera", !!currentVideoDeviceId);
}

watch(() => user.audio, refreshStream)
watch(() => user.video, refreshStream)

// WebRTC Life Cycle Hooks
watch(localStream, async (stream) => {
	if (isInit.value) {
		refreshConnection()
		return
	}

	isInit.value = true
	emits("update:pinParticipant", participants.value[0])

	console.log("Get Media");
	await createOffer()
});

function createConnection() {
	connection.value = new RTCPeerConnection(rtcConfig)
	console.log("Peer Connection Created");

	if (localStream.value) {
		localStream.value.getTracks().forEach(track => {
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

async function refreshConnection() {
	if (!localStream.value)
		return

	const audioTrack = localStream.value.getAudioTracks()[0]
	const videoTrack = localStream.value.getVideoTracks()[0]

	// console.log("Get Tracks", audioTrack, videoTrack);
	const senders = connection.value.getSenders()
		.reduce((a, sender) => ({ ...a, [sender.track.kind]: sender }), {}) as { audio: RTCRtpSender, video: RTCRtpSender }

	if (!!audioTrack)
		await senders["audio"].replaceTrack(audioTrack)
	if (!!videoTrack)
		await senders["video"].replaceTrack(videoTrack)
}

async function removeConnection(id: string) {
	console.log("Peer Connection removed");
	remoteStreams.value.delete(id)
}

async function onGetICECandidate(id: string, candidate: RTCIceCandidateInit) {
	console.log("On Receive new Candidate");
	await connection.value.addIceCandidate(candidate)
}

onMounted(() => {
	streaming.value = true

	socket.on("offer", createAnswer)
	socket.on("answer", addAnswer)
	socket.on("candidate", onGetICECandidate)
	socket.on("remove", removeConnection)
})

onBeforeUnmount(() => {
	// streaming.value = false

	socket.off("call", createAnswer)
	socket.off("receive", addAnswer)
	socket.off("candidate", onGetICECandidate)
	socket.off("remove", removeConnection)

	socket.disconnect()
	connection.value.close()
})
</script>

<template>
	<ul class="grid grid-cols-2 md:grid-cols-1 gap-2 md:max-w-[22vw] md:min-w-[22vw] h-2/5 md:h-full">
		<li v-for="(participant, index) in participants">
			<CallCard :local="participant.local" :name="participant.name.first" :audio="participant.audio"
				:video="participant.video" :stream="participant.stream" class="shrink-0"
				@click="emits('update:pinParticipant', participant)" />
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