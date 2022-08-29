<script setup lang="ts">
import { isNumber } from '@vueuse/shared';
import { useMedia } from '~/stores/media';
import { usePlayer } from '~/stores/player';
import { formatTime } from '~/utils/helpers'
import { Seek } from '~/utils/models';
import { PlaybackTimeUpdatedEvent, QualityChangeRequestedEvent } from "~/plugins/dash.js.client";

const { $player: player, $playerSocket } = useNuxtApp()
const socket = $playerSocket()

const config = useRuntimeConfig()
const media = useMedia()
const playerStore = usePlayer()

const props = defineProps({
	autoplay: { type: Boolean, required: true }, // Property Binding
	type: {},//Two-way Binding
	id: { type: String, required: true },//Two-way Binding
	episode: { type: Number, required: true }, // Two-way Binding
})

const emits = defineEmits<{
	(event: "update:fullscreen"): void // Event Binding
	(event: "update:controls", state: boolean): void // Event Binding
	(event: "update:episode", episode: number): void // Event Binding
}>()

watch(() => props.episode, (value: number) => {
	console.debug(`Episode ${value} is Playing`)
	player.initialize(video.value, src.value, props.autoplay);

	toggleDropdown(null)
})

const container = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const subtitle = ref<HTMLDivElement>()

const isInit = ref(false)

const isBuffering = ref(false)
const bufferTime = ref(0)

const isPlaying = ref(false)
const seekTime = ref(0)

const playbackRates = ref([0.5, 0.75, 1, 1.25, 2])
const playbackRateIndex = ref(2)

const isAuto = ref(true)
const qualities = ref<string[]>([])
const qualityIndex = ref(0)

const isMuted = ref(false)
const volume = ref(70)

const duration = ref(0)
const dropdown = ref<string>(null)

const isSubtitle = ref(false)
const { isFullscreen } = useFullscreen(container)

const userControls = ref(false)
const { idle } = useIdle(3000)
const controls = computed(() => {
	userControls.value = isPlaying.value ? (userControls.value ? !idle.value : false) : true

	emits("update:controls", userControls.value)
	return userControls.value
})

const tracks = computed(() => {
	return [
		{ value: seekTime.value, color: "bg-blue-400" },
		{ value: seekTime.value + bufferTime.value, color: "bg-slate-200/60" }
	]
})

const poster = computed(() => `${config.public.apiURL}/public/${props.type}/${props.id}/Landscape.avif`)
const src = computed(() => `${config.public.apiURL}/public/${props.type}/${props.id}/${props.episode}/manifest.mpd`)

const debugInfo = ref({
	bitrate: { reported: undefined, calculated: undefined },
	buffer: undefined,
	framerate: undefined,
	resolution: { width: undefined, height: undefined }
})

function changeEpisode(episode: "prev" | "next" | number, sync = true) {
	let newEpisode = isNumber(episode) ? episode : props.episode;
	if (!isNumber(episode))
		newEpisode += episode === "prev" ? -1 : +1
	newEpisode = useClamp(newEpisode, 1, media.totalEpisodes).value

	emits("update:episode", newEpisode)
	if (sync) {
		console.debug(`Local Episode playing ${newEpisode}`);
		socket.emit("episode", newEpisode)
	}
}

function changeBuffer(state: boolean, sync = true) {
	// TODO:Change Buffering
	// if (sync) {
	// 	console.debug(`Local Buffer ${isBuffering.value ? "load" : "empty"} at ${seekTime.value}`);
	//  playerStore.setSeek(seekTime.value)
	// 	socket.emit("buffer", isBuffering.value ? "load" : "empty", playerStore.seekStamp)
	// }
}

function togglePlay(isPaused = player.isPaused(), sync = true) {
	console.debug(`Video is ${isPaused ? "Played" : "Paused"}`);
	isPaused ? player.play() : player.pause()
	isPlaying.value = isPaused
	if (sync) {
		console.debug(`Local Playback ${isPaused ? "play" : "pause"} at ${seekTime.value}`);
		playerStore.playback = isPlaying.value ? "play" : "pause"
		playerStore.setSeek(seekTime.value)
		socket.emit("playback", isPaused ? "play" : "pause", playerStore.seekStamp)
	}

	toggleDropdown(null)
}
function changeSeek(seek: number | Seek, sync = true) {
	playerStore.setSeek(seek)
	seekTime.value = playerStore.seek

	player.seek(seekTime.value)
	bufferTime.value = 0
	if (sync) {
		console.debug(`Local Seek to ${seekTime.value}`);
		socket.emit("seek", playerStore.seekStamp)
	}

	toggleDropdown(null)
}

function changePlaybackRate(rateIndex: number, sync = true) {
	playbackRateIndex.value = useClamp(rateIndex, 0, playbackRates.value.length - 1).value
	player.setPlaybackRate(playbackRates.value[playbackRateIndex.value])
	if (sync) {
		console.debug(`Local PlaybackRate ${playbackRateIndex.value} at ${seekTime.value}`);
		playerStore.setSeek(seekTime.value)
		socket.emit("playback-rate", playbackRateIndex.value, playerStore.seekStamp)
	}

	toggleDropdown(null)
}

function changeQuality(currentResolutionIndex: number) {
	isAuto.value = currentResolutionIndex === -1

	const settings = player.getSettings()
	settings.streaming.abr.autoSwitchBitrate.video = isAuto.value
	player.updateSettings(settings)

	if (!isAuto.value) {
		player.setQualityFor("video", currentResolutionIndex, true)
	}

	toggleDropdown(null)
}

function toggleVolume(isUnmuted = !player.isMuted()) {
	console.debug(`Video is Muted ${isUnmuted}`);
	isMuted.value = isUnmuted
	player.setMute(isMuted.value)

	if (!volume.value)
		changeVolume(70)

	toggleDropdown(null)
}
function changeVolume(value: number) {
	volume.value = useClamp(value, 0, 100).value
	player.setVolume(volume.value / 100)

	if (!volume.value)
		toggleVolume(true)

	toggleDropdown(null)
}

function toggleSubtitle() {
	isSubtitle.value = !isSubtitle.value
	player.enableText(isSubtitle.value)
}
function changeSubtitle(lang: string) {
	player.setInitialMediaSettingsFor('text', { lang: lang, role: 'subtitle' });
}

function toggleFullscreen() {
	emits("update:fullscreen")
}

function toggleUserControls() {
	userControls.value = !userControls.value
}

function toggleDropdown(type: string | null) {
	dropdown.value = dropdown.value !== type ? type : null
}

// Input Devices Hooks
function onKeyboardControl(event: KeyboardEvent) {
	switch (event.code) {
		case "Space":
			togglePlay()
			break;
		case "ArrowLeft":
			changeSeek(seekTime.value - 5)
			break;
		case "ArrowRight":
			changeSeek(seekTime.value + 5)
			break;
		case "ArrowUp":
			changeVolume(volume.value + 5)
			break;
		case "ArrowDown":
			changeVolume(volume.value - 5)
			break;
		case "NumpadAdd":
			changePlaybackRate(playbackRateIndex.value + 1)
			break;
		case "NumpadSubtract":
			changePlaybackRate(playbackRateIndex.value - 1)
			break;
		default:
			break;
	}
}

useEventListener(window, "keydown", onKeyboardControl)

// Player Life Cycle Hooks
function onPlayerInit() {
	console.debug("Steam Initialized");
	duration.value = player.duration()
	player.attachTTMLRenderingDiv(subtitle.value);

	const textInfo = player.getBitrateInfoListFor("text")
	console.table(textInfo, ["mediaType", "bitrate"]);

	const audioInfo = player.getBitrateInfoListFor("audio")
	console.table(audioInfo, ["mediaType", "bitrate"]);

	const videoInfo = player.getBitrateInfoListFor("video")
	console.table(videoInfo, ["mediaType", "width", "height", "bitrate"]);

	for (const info of videoInfo) {
		qualities.value.push(`${info.height.toString()}p`)
	}

	const settings = player.getSettings()
	settings.streaming.buffer.stableBufferTime = 120
	settings.streaming.buffer.bufferTimeAtTopQuality = 180
	player.updateSettings(settings)

	// TODO: changeBuffer(playerStore.buffer,false)
	togglePlay(props.autoplay, false)
	changePlaybackRate(playerStore.playbackRate, false)
	changeSeek(playerStore.seekStamp, false)

	isInit.value = true
}

function onBufferLoaded() {
	console.debug("Video Buffer Loaded");
	isBuffering.value = false
	changeBuffer(isBuffering.value)
}

function onBufferEmptied() {
	console.debug("Video Buffer Empty");
	isBuffering.value = true
	bufferTime.value = 0
	changeBuffer(isBuffering.value)
}

function onPlaybackUpdate(event: PlaybackTimeUpdatedEvent) {
	seekTime.value = event.time
	bufferTime.value = player.getBufferLength("video")
	bufferTime.value = !isNaN(bufferTime.value) ? bufferTime.value : 0
}

function onQualityChange(event: QualityChangeRequestedEvent) {
	if (event.mediaType === 'video') {
		qualityIndex.value = event.newQuality
		changePlaybackRate(playbackRateIndex.value, false)
	}
}

// Debug info
const { pause, resume, isActive: debugMode } = useIntervalFn(() => {
	// TODO: debug info
	const streamInfo = player.getActiveStream().getStreamInfo();
	const dashAdapter = player.getDashAdapter();
	const dashMetrics = player.getDashMetrics();

	const periodIdx = streamInfo.index;
	const repSwitch = dashMetrics.getCurrentRepresentationSwitch('video')

	debugInfo.value.bitrate.reported = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation((repSwitch as any).to, periodIdx) / 1000) : NaN;
	debugInfo.value.buffer = dashMetrics.getCurrentBufferLevel('video')

	// TODO: adaptation type dashAdapter
	const adaptation = (dashAdapter as any).getAdaptationForType(periodIdx, 'video', streamInfo);
	const currentRep = adaptation?.Representation_asArray.find((rep) => {
		return rep.id === (repSwitch as any).to
	})

	debugInfo.value.framerate = currentRep.frameRate;
	debugInfo.value.resolution = { width: currentRep.width, height: currentRep.height }

}, 500)
pause()

function toggleDebugMode() {
	debugMode.value ? pause() : resume()
}

// WebSocket Life Cycle Hooks
function onSocketConnect() {
	console.debug("WebSocket Connected", socket.id);
}
function onSocketEpisode(id: string, episode: number) {
	console.debug(`By ${id} episode changed ${episode}`);
	changeEpisode(episode, false)
}
function onSocketBuffer(id: string, state: "load" | "empty", seek: Seek) {
	console.debug(`By ${id} Global Buffer ${state} at ${seek}`);
	// changeBuffer(state == "load" )
	changeSeek(seek, false)
}
function onSocketPlayback(id: string, state: "play" | "pause", seek: Seek) {
	console.debug(`By ${id} Global Playback ${state} at ${seek.time}`);
	togglePlay(state == "play", false)
	changeSeek(seek, false)
}
function onSocketPlaybackRate(id: string, rate: number, seek: Seek) {
	console.debug(`By ${id} Global PlaybackRate ${rate} at ${seek}`);
	changePlaybackRate(rate, false)
	changeSeek(seek, false)
}
function onSocketSeek(id: string, seek: Seek) {
	console.debug(`By ${id} Global Seek to ${seek}`);
	changeSeek(seek, false)
}
function onSocketDisconnect() {
	console.debug("WebSocket Disconnected");
}

onMounted(() => {
	player.initialize(video.value, src.value, props.autoplay);

	player.on("streamInitialized", onPlayerInit)
	player.on("bufferLoaded", onBufferLoaded)
	player.on("bufferStalled", onBufferEmptied)
	player.on("playbackTimeUpdated", onPlaybackUpdate)
	player.on("qualityChangeRequested", onQualityChange)

	socket.on("connect", onSocketConnect);
	socket.on("episode", onSocketEpisode)
	socket.on("buffer", onSocketBuffer);
	socket.on("playback", onSocketPlayback);
	socket.on("playback-rate", onSocketPlaybackRate);
	socket.on("seek", onSocketSeek);
	socket.on("disconnect", onSocketDisconnect);
})

onBeforeUnmount(() => {
	player.off("streamInitialized", onPlayerInit)
	player.off("bufferLoaded", onBufferLoaded)
	player.off("bufferStalled", onBufferEmptied)
	player.off("playbackTimeUpdated", onPlaybackUpdate)
	player.off("qualityChangeRendered", onQualityChange)

	socket.off("connect", onSocketConnect);
	socket.off("episode", onSocketEpisode)
	socket.off("buffer", onSocketBuffer);
	socket.off("playback", onSocketPlayback);
	socket.off("playback-rate", onSocketPlaybackRate);
	socket.off("seek", onSocketSeek);
	socket.off("disconnect", onSocketDisconnect);

	socket.disconnect()
})
</script>

<template>
	<main ref="container"
		class="relative -top-4 md:top-0 -left-2 md:left-0 w-[calc(100%+1rem)] md:w-full h-full md:rounded-lg bg-black overflow-hidden">
		<video ref="video" :poster="poster" class="absolute w-full h-full object-cover pc:object-contain"
			@click="toggleUserControls" />
		<div ref="subtitle" v-show="isSubtitle" />
		<div v-if="isInit && controls" class="absolute w-full h-full bg-gradient-to-t backdrop-gradient" />
		<div v-if="isInit && isBuffering"
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+1.25rem)]">
			<NuxtIcon name="loader" class="text-7xl animate-spin" />
		</div>
		<section v-if="isInit"
			class="relative top-1/2 grid grid-rows-[min-content_auto_min-content] grid-cols-3 gap-y-2 px-2 md:px-6 py-3 w-full -translate-y-1/2 transition-[height_opacity] duration-300 ease-out"
			:class="controls ? 'h-full opacity-100 cursor-auto' : 'h-[200%] opacity-0 cursor-none'"
			@click.self="toggleUserControls">
			<div
				class="row-start-1 col-start-1 col-span-2 invisible landscape:visible justify-start self-start text-xl font-head">
				{{  media.title  }}
			</div>
			<div class="row-start-1 col-start-3 justify-end self-start flex items-center gap-6">
				<NuxtIcon name="cast" class="text-[2rem] cursor-pointer" />
			</div>
			<div
				class="row-start-2 col-start-2 justify-center self-center flex pc:invisible items-center gap-8 translate-y-0 landscape:-translate-y-5 ">
				<VideoControls v-if="!isBuffering" :playback="isPlaying" @update:playback="togglePlay"
					@update:episode="changeEpisode" />
			</div>
			<div
				class="absolute -left-1 -right-1 -bottom-1 landscape:relative row-start-3 landscape:row-start-2 col-start-1 col-span-3 self-end">
				<Slider :max="duration" :tracks="tracks" @update:tracks="changeSeek" />
			</div>
			<div class="row-start-3 col-start-1 col-span-2 justify-start self-end flex items-center gap-4">
				<VideoControls class="hidden pc:inline" :playback="isPlaying" @update:playback="togglePlay"
					@update:episode="changeEpisode" />
				<NuxtIcon :name="isMuted ? 'volume-muted' : 'volume-full'"
					class="hidden landscape:inline text-[2rem] cursor-pointer" @click="toggleVolume()" />
				<Slider :max="100" :tracks="[{ value: Number(!isMuted) * volume, color: 'bg-slate-200' }]"
					@update:tracks="changeVolume" class="hidden landscape:flex w-24" />
				<span class="font-mono">{{  formatTime(seekTime)  }} / {{  formatTime(duration)  }}</span>
			</div>
			<div class="row-start-3 col-start-3 justify-end self-end flex items-center gap-6">
				<NuxtIcon :name="isSubtitle ? 'subtitle' : 'subtitle-off'"
					class="invisible landscape:visible text-[2rem] cursor-pointer" @click="toggleSubtitle" />
				<NuxtIcon name="sound-settings" class="invisible landscape:visible text-[2rem] cursor-pointer" />
				<NuxtIcon name="video-settings" class="invisible landscape:visible text-[2rem] cursor-pointer"
					@click="toggleDropdown('video')" />
				<NuxtIcon :name="isFullscreen ? 'screen-min' : 'screen-max'" @click="toggleFullscreen"
					class="text-[2rem] cursor-pointer" />
			</div>
			<dialog :open="dropdown !== null"
				class="pc:left-auto pc:right-6 top-1/2 pc:top-auto pc:bottom-0 -translate-y-[calc(50%+1.25rem)] pc:-translate-y-[4.5rem] px-0 py-1 w-56 h-48 bg-slate-200 rounded-md shadow-lg overflow-y-auto">
				<ul v-if="dropdown === 'video'" class="drop-down flex flex-col">
					<li @click="toggleDropdown(null)">
						<div>
							<NuxtIcon name="keyframes" class="text-2xl" />
							<span>FPS</span>
						</div>
						<span>24 fps</span>
					</li>
					<li @click="toggleDropdown(null)">
						<div>
							<NuxtIcon name="mountain" class="text-2xl" />
							<span>Color</span>
						</div>
						<span>SDR</span>
					</li>
					<li @click="toggleDropdown('video-playback')">
						<div>
							<NuxtIcon name="speed" class="text-2xl" />
							<span>Playback</span>
						</div>
						<span>{{  playbackRates[playbackRateIndex]  }}x</span>
					</li>
					<li @click="toggleDropdown('video-resolution')">
						<div>
							<NuxtIcon name="downscale" class="text-2xl" />
							<span>Resolution</span>
						</div>
						<span>{{  isAuto ? 'Auto' : ''  }} {{  qualities[qualityIndex]  }}</span>
					</li>
					<li @click="() => { toggleDropdown(null); toggleDebugMode() }">
						<div>
							<NuxtIcon name="stats" class="text-2xl" />
							<span>DebugMode</span>
						</div>
						<span>{{  debugMode ? 'On' : 'Off'  }}</span>
					</li>
				</ul>
				<ul v-else-if="dropdown === 'video-playback'" class="drop-down flex-col">
					<li v-for="(playbackRate, currentPlaybackRateIndex) in playbackRates"
						:class="{ 'highlight': currentPlaybackRateIndex === playbackRateIndex }"
						@click="changePlaybackRate(currentPlaybackRateIndex)">
						{{  playbackRate  }}
					</li>
				</ul>
				<ul v-else-if="dropdown === 'video-resolution'" class="drop-down flex flex-col-reverse">
					<li v-for="(resolution, currentResolutionIndex) in ['Auto', ...qualities]"
						:class="{ 'highlight': isAuto ? resolution === 'Auto' : currentResolutionIndex - 1 === qualityIndex }"
						@click="changeQuality(currentResolutionIndex - 1)">
						{{  resolution  }}
					</li>
				</ul>
			</dialog>
		</section>
		<dialog :open="debugMode"
			class="absolute top-2 left-2 m-0 px-4 py-2 w-fit text-xs text-white bg-slate-600/40 rounded-md shadow-lg">
			<div>
				<label for="reportedBitrate">Reported bitrate: </label>
				<span>{{  debugInfo.bitrate.reported  }} Kbps</span>
			</div>
			<div>
				<label for="calculatedBitrate">Calculated bitrate: </label>
				<span>{{  debugInfo.bitrate.calculated  }} Kbps</span>
			</div>
			<div>
				<label for="buffer">Buffer level: </label>
				<span>{{  debugInfo.buffer  }} secs</span>
			</div>
			<div>
				<label for="framerate">Framerate: </label>
				<span>{{  debugInfo.framerate  }} fps</span>
			</div>
			<div>
				<label for="resolution">Resolution: </label>
				<span>{{  debugInfo.resolution.width  }}x{{  debugInfo.resolution.height  }}</span>
			</div>
		</dialog>
	</main>
</template>

<style>
main {
	color: white;
}

main>div.backdrop-gradient {
	--tw-gradient-stops: rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0.3) 100%;
}

dialog>.drop-down>li {
	@apply flex justify-between items-center px-4 py-3 text-xs cursor-pointer;
}

dialog>.drop-down>li.highlight {
	@apply bg-blue-400 text-white;
}

dialog>.drop-down>li>div {
	@apply flex items-center gap-2;
}
</style>