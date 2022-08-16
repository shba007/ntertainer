<script setup lang="ts">
import { useClamp } from '@vueuse/math'
import { useMedia } from '../stores/media';
import { PlaybackTimeUpdatedEvent, QualityChangeRequestedEvent } from "~/plugins/dash.js.client";
import { isNumber } from '@vueuse/shared';

const { $player: player } = useNuxtApp()

const media = useMedia()
const config = useRuntimeConfig()

const props = defineProps({
	autoplay: { type: Boolean, default: false }, // Property Binding
	episode: {}, // Two-way Binding
	buffer: {}, // Two-way Binding
	playback: {}, // Two-way Binding
	playbackRate: {}, // Two-way Binding
	seek: {} // Two-way Binding
})

const emits = defineEmits<{
	(event: "update:fullscreen"): void // Event Binding
	(event: "update:controls", state: boolean): void // Event Binding
	(event: "update:episode", episode: number): void // Two-way Binding
	(event: "update:buffer", state: "load" | "empty", time: number): void // Two-way Binding
	(event: "update:playback", state: "play" | "pause", time: number): void // Two-way Binding
	(event: "update:playbackRate", rate: number, time: number): void // Two-way Binding
	(event: "update:seek", time: number): void // Two-way Binding
}>()

watch(() => props.episode, (value: number) => {
	console.debug("Parent Episode", value);
	changeEpisode(value, false)
})

watch(() => props.buffer, (value: "load" | "empty") => {
	console.debug("Parent Buffer", value);
	changeBuffer(value === "load", false)
})

watch(() => props.playback, (value: "play" | "pause") => {
	console.debug("Parent Playback", value);
	togglePlay(value === "play", false)
})

watch(() => props.playbackRate, (value: number) => {
	console.debug("Parent PlaybackRate", value);
	changePlaybackRate(value, false)
})

watch(() => props.seek, (value: number) => {
	console.debug("Parent Seek", value);
	changeSeek(value, false)
})

const container = ref<HTMLElement>(null)
const video = ref<HTMLVideoElement>(null)

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

const { isFullscreen } = useFullscreen(container)

const userControls = ref(false)
const { idle } = useIdle(3000)
const controls = computed(() => {
	userControls.value = props.playback === "play" ? (userControls.value ? !idle.value : false) : true
	emits("update:controls", userControls.value)
	return userControls.value
})

const tracks = computed(() => {
	return [
		{ value: seekTime.value, color: "bg-blue-400" },
		{ value: seekTime.value + bufferTime.value, color: "bg-slate-200/60" }
	]
})

const poster = computed(() => `${config.public.apiURL}/public/${media.type}/${media.id}/Landscape.jpg`)
const src = computed(() => `${config.public.apiURL}/public/${media.type}/${media.id}/${media.episode.current}/manifest.mpd`)

function formatTime(duration: number) {
	duration = Math.max(duration, 0);

	const h = Math.floor(duration / 3600);
	const m = Math.floor(duration % 3600 / 60);
	const s = Math.floor(duration % 3600 % 60);

	const hour = h > 0 ? h : ""

	let prefix = h > 0 ? ":" + (m < 10 ? "0" : "") : ""
	const minute = prefix + m

	prefix = s < 10 ? "0" : ""
	const second = prefix + s

	return `${hour}${minute}:${second}`
}

function changeEpisode(episode: "prev" | "next" | number, sync = true) {
	let newEpisode = isNumber(episode) ? episode : media.episode.current;
	if (!isNumber(episode))
		newEpisode += episode === "prev" ? -1 : +1

	media.episode.current = useClamp(newEpisode, 1, media.episode.total).value
	console.log(`Episode ${media.episode.current} is Playing`)
	player.initialize(video.value, src.value, props.autoplay);
	if (sync)
		emits("update:episode", media.episode.current)

	toggleDropdown(null)
}

function changeBuffer(state: boolean, sync = true) {
	// TODO:Change Buffering
}

function togglePlay(isPaused = player.isPaused(), sync = true) {
	console.debug(`Video is ${isPaused ? "Played" : "Paused"}`);
	isPlaying.value = isPaused
	isPaused ? player.play() : player.pause()
	if (sync)
		emits("update:playback", isPaused ? "play" : "pause", seekTime.value)

	toggleDropdown(null)
}
function changeSeek(time: number, sync = true) {
	seekTime.value = time
	player.seek(time)
	bufferTime.value = 0
	if (sync)
		emits("update:seek", seekTime.value)

	toggleDropdown(null)
}

function changePlaybackRate(rateIndex: number, sync = true) {
	playbackRateIndex.value = useClamp(rateIndex, 0, playbackRates.value.length - 1).value
	player.setPlaybackRate(playbackRates.value[playbackRateIndex.value])
	if (sync)
		emits("update:playbackRate", playbackRateIndex.value, seekTime.value)

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

// Player Life Cycle Hooks
function onPlayerInit() {
	console.debug("Steam Initialized");
	duration.value = player.duration()

	const audioInfo = player.getBitrateInfoListFor("audio")
	console.table(audioInfo, ["mediaType", "bitrate"]);

	const videoInfo = player.getBitrateInfoListFor("video")
	console.table(videoInfo, ["mediaType", "width", "height", "bitrate"]);

	for (const info of videoInfo) {
		qualities.value.push(`${info.height.toString()}p`)
	}

	isBuffering.value = false
	bufferTime.value = 0

	isPlaying.value = props.autoplay
	seekTime.value = 0

	isInit.value = true
}

function onBufferLoaded() {
	console.debug("Video Buffer Loaded");
	isBuffering.value = false
	emits("update:buffer", "load", seekTime.value)
}

function onBufferEmptied() {
	console.debug("Video Buffer Empty");
	isBuffering.value = true
	bufferTime.value = 0
	emits("update:buffer", "empty", seekTime.value)
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

useEventListener(window, "keydown", onKeyboardControl)

onMounted(() => {
	player.initialize(video.value, src.value, props.autoplay);

	player.on("streamInitialized", onPlayerInit)
	player.on("bufferLoaded", onBufferLoaded)
	player.on("bufferStalled", onBufferEmptied)
	player.on("playbackTimeUpdated", onPlaybackUpdate)
	player.on("qualityChangeRequested", onQualityChange)
})

onBeforeUnmount(() => {
	player.off("streamInitialized", onPlayerInit)
	player.off("bufferLoaded", onBufferLoaded)
	player.off("bufferStalled", onBufferEmptied)
	player.off("playbackTimeUpdated", onPlaybackUpdate)
	player.off("qualityChangeRendered", onQualityChange)
})
</script>

<template>
	<main ref="container"
		class="relative -top-4 md:top-0 -left-2 md:left-0 w-[calc(100%+1rem)] md:w-full h-full md:rounded-lg bg-black overflow-hidden">
		<video ref="video" :poster="poster" class="absolute w-full h-full object-cover pc:object-contain"
			@click="toggleUserControls" />
		<div v-if="isInit && controls" class="absolute w-full h-full bg-gradient-to-t backdrop-gradient" />
		<div v-if="isInit && isBuffering"
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+1.25rem)]">
			<NuxtIcon name="loader" class="text-7xl animate-spin" />
		</div>
		<section v-if="isInit"
			class="relative top-1/2 grid grid-rows-[min-content_auto_min-content] grid-cols-3 gap-y-2 px-2 md:px-6 py-3 w-full -translate-y-1/2 transition-[height_opacity] duration-300 ease-out"
			:class="controls ? 'h-full opacity-100' : 'h-[200%] opacity-0'" @click.self="toggleUserControls">
			<div
				class="row-start-1 col-start-1 col-span-2 invisible landscape:visible justify-start self-start text-xl font-head">
				{{ media.title }}
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
				<span class="font-mono">{{ formatTime(seekTime) }} / {{ formatTime(duration) }}</span>
			</div>
			<div class="row-start-3 col-start-3 justify-end self-end flex items-center gap-6">
				<NuxtIcon name="subtitle" class="invisible landscape:visible text-[2rem] cursor-pointer" />
				<NuxtIcon name="sound-settings" class="invisible landscape:visible text-[2rem] cursor-pointer" />
				<NuxtIcon name="video-settings" class="invisible landscape:visible text-[2rem] cursor-pointer"
					@click="toggleDropdown('video')" />
				<NuxtIcon :name="isFullscreen ? 'screen-min' : 'screen-max'" @click="toggleFullscreen"
					class="text-[2rem] cursor-pointer" />
			</div>
			<dialog :open="dropdown !== null"
				class="pc:left-auto pc:right-6 top-1/2 mobile:top-1/2 pc:top-auto pc:bottom-0 -translate-y-[calc(50%+1.25rem)] pc:-translate-y-[4.5rem] px-0 py-1 w-56 bg-slate-200 rounded-md shadow-lg">
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
						<span>{{ playbackRates[playbackRateIndex] }}x</span>
					</li>
					<li @click="toggleDropdown('video-resolution')">
						<div>
							<NuxtIcon name="downscale" class="text-2xl" />
							<span>Resolution</span>
						</div>
						<span>{{ isAuto ? 'Auto' : '' }} {{ qualities[qualityIndex] }}</span>
					</li>
				</ul>
				<ul v-else-if="dropdown === 'video-playback'" class="drop-down flex-col">
					<li v-for="(playbackRate, currentPlaybackRateIndex) in playbackRates"
						:class="{ 'highlight': currentPlaybackRateIndex === playbackRateIndex }"
						@click="changePlaybackRate(currentPlaybackRateIndex)">
						{{ playbackRate }}
					</li>
				</ul>
				<ul v-else-if="dropdown === 'video-resolution'" class="drop-down flex flex-col-reverse">
					<li v-for="(resolution, currentResolutionIndex) in ['Auto', ...qualities]"
						:class="{ 'highlight': isAuto ? resolution === 'Auto' : currentResolutionIndex - 1 === qualityIndex }"
						@click="changeQuality(currentResolutionIndex - 1)">
						{{ resolution }}
					</li>
				</ul>
			</dialog>
		</section>
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