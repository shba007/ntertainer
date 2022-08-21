<script setup lang="ts">
import { useUser } from '../../stores/user';
import { Participant } from './Card.vue';

const { $callSocket } = useNuxtApp()
const user = useUser()

const emits = defineEmits<{
	(event: "update:pinParticipant", participant: Participant): void
}>()
const socket = $callSocket()
const remoteStreams = ref<Map<string, MediaStream>>(new Map())

const localParticipant = computed(() => ({
	id: "0",
	local: true,
	name: { first: "Participant 1", last: "" },
	audio: user.audio,
	video: user.video,
	stream: user.stream
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

// WebRTC Life Cycle Hooks
watch(() => user.stream, async () => {
	if (isInit.value) {
		refreshConnection()
		return
	}

	isInit.value = true
	emits("update:pinParticipant", localParticipant.value)

	// console.log("Got Media");
	await createOffer()
});

function createConnection() {
	connection.value = new RTCPeerConnection(rtcConfig)
	console.debug("Peer Connection Created");

	if (user.stream) {
		user.stream.getTracks().forEach(track => {
			connection.value.addTrack(track)
		})
	}

	connection.value.onicecandidate = (event) => {
		if (event.candidate) {
			console.debug("New ICE Candidate");
			socket.emit("candidate", event.candidate)
		}
	}

	connection.value.ontrack = (event) => {
		console.debug("New Track added", event.track);
		const remoteStream = remoteStreams.value.get(connectionId.value)
		remoteStream.addTrack(event.track)
	}
}

async function createOffer() {
	createConnection()

	const offer = await connection.value.createOffer()
	await connection.value.setLocalDescription(offer)
	console.debug("Offer Created:", offer);

	// console.log("local", connection.value.localDescription);
	// console.log("remote", connection.value.remoteDescription);

	socket.emit("offer", offer)
}

async function createAnswer(id: string, offer: RTCSessionDescriptionInit) {
	connectionId.value = id

	createConnection()
	remoteStreams.value.set(id, new MediaStream())
	await connection.value.setRemoteDescription(offer)
	console.debug("Offer Set:", offer);

	const answer = await connection.value.createAnswer()
	await connection.value.setLocalDescription(answer)
	console.debug("Answer Created:", answer);

	// console.log("local", connection.value.localDescription);
	// console.log("remote", connection.value.remoteDescription);

	socket.emit("answer", answer)
}

async function addAnswer(id: string, answer: RTCSessionDescriptionInit) {
	connectionId.value = id

	remoteStreams.value.set(id, new MediaStream())
	await connection.value.setRemoteDescription(answer)
	console.debug("Answer Set:", answer);

	// console.log("local", connection.value.localDescription);
	// console.log("remote", connection.value.remoteDescription);
}

async function refreshConnection() {
	if (!user.stream)
		return

	const audioTrack = user.stream.getAudioTracks()[0]
	const videoTrack = user.stream.getVideoTracks()[0]

	// console.log("Get Tracks", audioTrack, videoTrack);
	const senders = connection.value.getSenders()
		.reduce((a, sender) => ({ ...a, [sender.track.kind]: sender }), {}) as { audio: RTCRtpSender, video: RTCRtpSender }

	if (senders.audio || senders.video) {
		if (!!audioTrack)
			await senders["audio"].replaceTrack(audioTrack)
		if (!!videoTrack)
			await senders["video"].replaceTrack(videoTrack)
	}
}

async function removeConnection(id: string) {
	console.debug("Peer Connection removed");
	remoteStreams.value.delete(id)
}

async function onGetICECandidate(id: string, candidate: RTCIceCandidateInit) {
	console.debug("On Receive new Candidate");
	await connection.value.addIceCandidate(candidate)
}

onMounted(async () => {
	socket.on("offer", createAnswer)
	socket.on("answer", addAnswer)
	socket.on("candidate", onGetICECandidate)
	socket.on("remove", removeConnection)
})

onBeforeUnmount(() => {
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