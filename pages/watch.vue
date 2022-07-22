<script setup lang="ts">
const { $playerSocket } = useNuxtApp();
const config = useRuntimeConfig();

const mediaMeta = ref({ type: "erotica", id: "111-1" })
const media = await queryContent(mediaMeta.value.type, mediaMeta.value.id).only(["title"]).findOne()
const poster = `/media/${mediaMeta.value.type}/${mediaMeta.value.id}/Landscape.jpg`
const src = `/media/${mediaMeta.value.type}/${mediaMeta.value.id}/1/manifest.mpd`

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

const pinedStream = ref<MediaStream>(null)
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
	console.log(`Local Buffer ${state} at ${time}`);
	// TODO: socket.emit("buffer", state, time)
	buffer.value = state
	seek.value = time
}
function onPlayback(state: "play" | "pause", time: number) {
	console.log(`Local Playback ${state} at ${time}`);
	socket.emit("playback", state, time)
	playback.value = state
	seek.value = time
}
function onPlaybackRate(rate: number, time: number) {
	console.log(`Local PlaybackRate ${rate} at ${time}`);
	socket.emit("playback-rate", rate, time)
	playbackRate.value = rate
	seek.value = time
}
function onSeek(time: number) {
	console.log(`Local Seek to ${time}`);
	socket.emit("seek", time)
	seek.value = time
}

// Call Life Cycle Hooks
function onPinStream(stream: MediaStream) {
	pinedStream.value = stream
}

// WebSocket Life Cycle Hooks
function onSocketConnect() {
	console.log("WebSocket Connected", socket.id);
	setTimeout(onSocketInit, 500)
}
async function onSocketInit() {
	const { data: room } = await useFetch<{
		id: string;
		call: string;
		chat: string;
		player: {
			buffer: "load" | "empty";
			playback: "play" | "pause";
			playbackRate: number;
			seek: number;
		}
	}>(`${config.public.apiURL}/room`)
	const player = room.value.player
	console.log(`Global Player Status`, player);

	// buffer.value = player.buffer
	playback.value = player.playback
	playbackRate.value = player.playbackRate
	seek.value = player.seek
}
function onSocketBuffer(id: string, state: "load" | "empty", time: number) {
	console.log(`By ${id} Global Buffer ${state} at ${time}`);
	buffer.value = state
	seek.value = time
}
function onSocketPlayback(id: string, state: "play" | "pause", time: number) {
	console.log(`By ${id} Global Playback ${state} at ${time}`);
	playback.value = state
	seek.value = time
	lastActive.value = 0
}
function onSocketPlaybackRate(id: string, rate: number, time: number) {
	console.log(`By ${id} Global PlaybackRate ${rate} at ${time}`);
	playbackRate.value = rate
	seek.value = time
	lastActive.value = 0
}
function onSocketSeek(id: string, time: number) {
	console.log(`By ${id} Global Seek to ${time}`);
	seek.value = time
	lastActive.value = 0
}
function onSocketDisconnect() {
	console.log("WebSocket Disconnected");
}

onMounted(() => {
	socket.on("connect", onSocketConnect);
	// socket.on("init", onSocketInit);
	socket.on("buffer", onSocketBuffer);
	socket.on("playback", onSocketPlayback);
	socket.on("playback-rate", onSocketPlaybackRate);
	socket.on("seek", onSocketSeek);
	socket.on("disconnect", onSocketDisconnect);
})

onBeforeUnmount(() => {
	socket.off("connect", onSocketConnect);
	// socket.off("init", onSocketInit);
	socket.off("buffer", onSocketBuffer);
	socket.off("playback", onSocketPlayback);
	socket.off("playback-rate", onSocketPlaybackRate);
	socket.off("seek", onSocketSeek);
	socket.off("disconnect", onSocketDisconnect);

	socket.disconnect()
})
</script>

<template>
	<div class="relative flex flex-col md:flex-row gap-2 px-2 py-4 w-screen h-screen">
		<div ref="container" class="relative md:h-full aspect-video">
			<CallBar v-show="controls"
				class="fixed left-0 top-1/2 invisible landscape:visible -translate-y-[calc(50%+1.25rem)] z-10" />
			<CallCard v-if="isFullscreen" v-show="controls" :stream="pinedStream"
				class="fixed right-2 top-2 md:right-4 md:top-4 invisible landscape:visible z-10" />
			<ClientOnly placeholder="Loading...">
				<LazyVideoPlayer :title="media.title" :poster="poster" :src="src" :autoplay="false" :controls="controls"
					@update:fullscreen="onFullscreen" :buffer="buffer" :playback="playback" :playbackRate="playbackRate"
					:seek="seek" @update:buffer="onBuffer" @update:playback="onPlayback"
					@update:playbackRate="onPlaybackRate" @update:seek="onSeek" />
			</ClientOnly>
		</div>
		<div class="h-2/5 md:h-full overflow-y-scroll">
			<!-- <CallMenu @update:pinStream="onPinStream" /> -->
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