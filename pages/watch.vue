<script setup lang="ts">
import { Participant } from '../components/Call/Card.vue.js';

const { $playerSocket } = useNuxtApp();
const config = useRuntimeConfig();

// const mediaMeta = ref({ type: "erotica", id: "111-1", episode: "1" })
const mediaMeta = reactive({ type: "movie", id: "8-1", episode: "1" })
const media = await queryContent(mediaMeta.type, mediaMeta.id).only(["title"]).findOne()
const poster = `${config.public.apiURL}/public/${mediaMeta.type}/${mediaMeta.id}/Landscape.jpg`
const src = `${config.public.apiURL}/public/${mediaMeta.type}/${mediaMeta.id}/${mediaMeta.episode}/manifest.mpd`

const socket = $playerSocket()
const container = ref<HTMLElement>(null)

const buffer = ref<"load" | "empty">(null)
const playback = ref<"play" | "pause">(null)
const playbackRate = ref<number>(null)
const seek = ref<number>(null)

const {
	isSupported: isFullscreenSupported,
	isFullscreen,
	enter: enterFullscreen,
	exit: exitFullScreen
} = useFullscreen(container)

const {
	isSupported: isScreenOrientationSupported,
	lockOrientation,
	unlockOrientation
} = useScreenOrientation()

const { idle, lastActive } = useIdle(5000)
const controls = computed(() => playback.value === "play" ? !idle.value : true)

const pinedParticipant = ref<Participant>(null)
// Player Life Cycle Hooks
async function onFullscreen() {
	if (!isFullscreenSupported)
		return

	if (!isFullscreen.value) {
		await enterFullscreen()
		if (isScreenOrientationSupported)
			await lockOrientation("landscape")
	} else {
		await exitFullScreen()
		if (isScreenOrientationSupported)
			unlockOrientation()
	}
}

function onBuffer(state: "load" | "empty", time: number) {
	console.debug(`Local Buffer ${state} at ${time}`);
	// TODO: socket.emit("buffer", state, time)
	buffer.value = state
	seek.value = time
}
function onPlayback(state: "play" | "pause", time: number) {
	console.debug(`Local Playback ${state} at ${time}`);
	socket.emit("playback", state, time)
	playback.value = state
	seek.value = time
}
function onPlaybackRate(rate: number, time: number) {
	console.debug(`Local PlaybackRate ${rate} at ${time}`);
	socket.emit("playback-rate", rate, time)
	playbackRate.value = rate
	seek.value = time
}
function onSeek(time: number) {
	console.debug(`Local Seek to ${time}`);
	socket.emit("seek", time)
	seek.value = time
}

// Call Life Cycle Hooks
function onPinStream(participant: Participant) {
	pinedParticipant.value = participant
}

// WebSocket Life Cycle Hooks
function onSocketConnect() {
	console.debug("WebSocket Connected", socket.id);
	setTimeout(onSocketInit, 2000)
}
async function onSocketInit() {
	const { data: room } = await useFetch<{
		id: string;
		call: string;
		chat: {
			audio: boolean;
			video: boolean;
			id: string;
		}[];
		player: {
			buffer: "load" | "empty";
			playback: "play" | "pause";
			playbackRate: number;
			seek: number;
		}
	}>(`${config.public.apiURL}/room`, { pick: ['player'] })

	const player = room.value.player
	console.debug(`Global Player Status`, player);

	// TODO: buffer.value = player.buffer
	playback.value = player.playback
	playbackRate.value = player.playbackRate
	seek.value = player.seek
}
function onSocketBuffer(id: string, state: "load" | "empty", time: number) {
	console.debug(`By ${id} Global Buffer ${state} at ${time}`);
	buffer.value = state
	seek.value = time
}
function onSocketPlayback(id: string, state: "play" | "pause", time: number) {
	console.debug(`By ${id} Global Playback ${state} at ${time}`);
	playback.value = state
	seek.value = time
	lastActive.value = 0
}
function onSocketPlaybackRate(id: string, rate: number, time: number) {
	console.debug(`By ${id} Global PlaybackRate ${rate} at ${time}`);
	playbackRate.value = rate
	seek.value = time
	lastActive.value = 0
}
function onSocketSeek(id: string, time: number) {
	console.debug(`By ${id} Global Seek to ${time}`);
	seek.value = time
	lastActive.value = 0
}
function onSocketDisconnect() {
	console.debug("WebSocket Disconnected");
}

onMounted(() => {
	socket.on("connect", onSocketConnect);
	socket.on("buffer", onSocketBuffer);
	socket.on("playback", onSocketPlayback);
	socket.on("playback-rate", onSocketPlaybackRate);
	socket.on("seek", onSocketSeek);
	socket.on("disconnect", onSocketDisconnect);
})

onBeforeUnmount(() => {
	socket.off("connect", onSocketConnect);
	socket.off("buffer", onSocketBuffer);
	socket.off("playback", onSocketPlayback);
	socket.off("playback-rate", onSocketPlaybackRate);
	socket.off("seek", onSocketSeek);
	socket.off("disconnect", onSocketDisconnect);

	socket.disconnect()
})
</script>

<template>
	<div class="flex flex-col md:flex-row gap-2 px-2 py-4 max-h-full">
		<div ref="container" class="relative w-full md:h-full aspect-video">
			<CallBar v-show="controls"
				class="fixed left-0 top-1/2 invisible landscape:visible -translate-y-[calc(50%+1.25rem)] z-10" />
			<CallCard v-if="isFullscreen" v-show="controls" :fullscreen="true" :local="pinedParticipant.local"
				:name="pinedParticipant.name.first" :audio="pinedParticipant.audio" :video="pinedParticipant.video"
				:stream="pinedParticipant.stream"
				class="fixed right-2 top-2 md:right-4 md:top-4 invisible landscape:visible z-10" />
			<ClientOnly placeholder="Loading...">
				<LazyVideoPlayer :title="media.title" :poster="poster" :src="src" :autoplay="false" :controls="controls"
					@update:fullscreen="onFullscreen" :buffer="buffer" :playback="playback" :playbackRate="playbackRate"
					:seek="seek" @update:buffer="onBuffer" @update:playback="onPlayback"
					@update:playbackRate="onPlaybackRate" @update:seek="onSeek" />
			</ClientOnly>
		</div>
		<CallMenu @update:pinParticipant="onPinStream" />
	</div>
</template>