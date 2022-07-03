<script setup lang="ts">
import { MediaPlayer, MediaPlayerSettingClass, PlaybackTimeUpdatedEvent } from "dashjs";

const container = ref<HTMLElement>(null)
const video = ref<HTMLVideoElement>(null)

const media = "Big_Buck_Bunny"// "Fitness_Model_Loves_Big_Black_Dick" // "Mia_Khalifa_is_Back_and_Hotter_Than_Ever"
const videoURL = ref(`/videos/${media}/manifest.mpd`)
const posterURL = ref(`posters/${media}.webp`)
const title = ref(media.replaceAll("_", " "))
const autoplay = ref(false)

const player = ref(MediaPlayer().create())
const settings = ref<MediaPlayerSettingClass>(null)

const isPlaying = ref(false)
const isLoading = ref(false)
const isFullscreen = ref(false)
const isAuto = ref(true)
const isContentFit = ref(true)
const dropdown = ref<string>(null)
const resolutions = ref<string[]>(['Auto'])
const bufferTime = ref(0)
const currentTime = ref(0)
const duration = ref(0)
const quality = ref(0)
const currentPlaybackRate = ref(1)

const tracks = computed(() => {
	return [
		{ value: currentTime.value, color: 'bg-blue-400' },
		{ value: currentTime.value + bufferTime.value, color: 'bg-slate-200/60' }
	]
})

function timeFormat(duration) {
	duration = Math.max(duration, 0);

	const h = Math.floor(duration / 3600);
	const m = Math.floor(duration % 3600 / 60);
	const s = Math.floor(duration % 3600 % 60);
	return `${h === 0 ? '' : ((h < 10 ? '0' : '') + h + ':')}${h !== 0 || m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
function calculateDimensions() {
	isContentFit.value = container.value.offsetWidth * 2 < container.value.offsetHeight * 3
}

function togglePlay() {
	if (isPlaying.value) {
		console.log('Video is Paused');
		player.value.pause()
	} else {
		console.log('Video is Played');
		player.value.play()
	}
}
function toggleDropdown(type: string | null) {
	dropdown.value = dropdown.value !== type ? type : null
}
async function toggleFullscreen() {
	if (isFullscreen.value) {
		document.exitFullscreen()
		screen.orientation.unlock()
	} else {
		try {
			await container.value.requestFullscreen()
			await screen.orientation.lock('landscape')
		} catch (error) {
			console.log(error);
		}
	}

	isFullscreen.value = !isFullscreen.value
}

function changeSeek(time: number) {
	currentTime.value = time
	player.value.seek(time)

	dropdown.value = null
}
function changeQuality(resolution: string) {
	const config = resolutions.value.findIndex((r) => r === resolution)

	isAuto.value = config === 0
	settings.value.streaming.abr.autoSwitchBitrate.video = isAuto.value
	player.value.updateSettings(settings.value)

	if (!isAuto.value) {
		quality.value = config - 1
		player.value.setQualityFor('video', quality.value, true)
	}

	dropdown.value = null
}
function changePlaybackRate(rate: number) {
	currentPlaybackRate.value = rate
	player.value.setPlaybackRate(rate)

	dropdown.value = null
}

function onKeyboardControl(event: KeyboardEvent) {
	if (event.key === " ")
		togglePlay()
	else if (event.key === "ArrowLeft")
		changeSeek(currentTime.value - 5)
	else if (event.key === "ArrowRight")
		changeSeek(currentTime.value + 5)
}

// Player Life Cycle Hooks
function onPlayerInit() {
	console.log("Steam Initialized");

	duration.value = player.value.duration()
	settings.value = player.value.getSettings()

	const audioInfo = player.value.getBitrateInfoListFor('audio')
	console.table(audioInfo, ["mediaType", "bitrate"]);

	const videoInfo = player.value.getBitrateInfoListFor('video')
	console.table(videoInfo, ["mediaType", "width", "height", "bitrate"]);

	for (const info of videoInfo) {
		resolutions.value.push(`${info.height.toString()}p`)
	}
}

function onBufferLoaded() {
	console.log("Video Buffer Loaded");
	isLoading.value = false
}

function onBufferEmptied() {
	console.log("Video Buffer Empty");
	isLoading.value = true
	bufferTime.value = 0
}

function onPlaybackStarted() {
	console.log("Video Playback Started");
	isPlaying.value = true
}

function onPlaybackPaused() {
	console.log("Video Playback Paused");
	isPlaying.value = false
}

function onPlaybackUpdate(event: PlaybackTimeUpdatedEvent) {
	currentTime.value = event.time
	bufferTime.value = player.value.getBufferLength('video')
	bufferTime.value = !isNaN(bufferTime.value) ? bufferTime.value : 0
	quality.value = player.value.getQualityFor('video')
	player.value.setPlaybackRate(currentPlaybackRate.value)
}

onMounted(() => {
	player.value.initialize(video.value, videoURL.value, autoplay.value);

	player.value.on("streamInitialized", onPlayerInit)
	player.value.on("bufferLoaded", onBufferLoaded)
	player.value.on("bufferStalled", onBufferEmptied)
	player.value.on("playbackStarted", onPlaybackStarted)
	player.value.on("playbackPaused", onPlaybackPaused)
	player.value.on("playbackTimeUpdated", onPlaybackUpdate)

	calculateDimensions()
	window.addEventListener('resize', useThrottle(calculateDimensions, 200))
	window.addEventListener("keyup", onKeyboardControl)
})

onBeforeUnmount(() => {
	player.value.off("streamInitialized", onPlayerInit)
	player.value.off("bufferLoaded", onBufferLoaded)
	player.value.off("bufferStalled", onBufferEmptied)
	player.value.off("playbackStarted", onPlaybackStarted)
	player.value.off("playbackPaused", onPlaybackPaused)
	player.value.off("playbackTimeUpdated", onPlaybackUpdate)

	window.removeEventListener("keyup", onKeyboardControl)
})
</script>

<template>
	<main ref="container" class="relative w-full h-full bg-black">
		<video ref="video" :poster="posterURL" :src="videoURL" class="absolute w-full h-full"
			:class="{ 'object-cover': !isContentFit }">
		</video>
		<section
			class="relative grid grid-rows-[min-content_auto_min-content] grid-cols-3 gap-y-2 px-6 py-3 w-full h-full">
			<div class="row-start-1 col-span-2 justify-start self-start text-xl font-head">
				{{ title }}
			</div>
			<div class="row-start-1 col-start-3 justify-end self-start flex items-center gap-6">
				<NuxtIcon name="cast" class="text-[2rem] cursor-pointer" />
			</div>
			<div class="row-start-2 col-start-2 justify-center self-center flex items-center gap-8 -translate-y-5">
				<template v-if="isLoading">
					<NuxtIcon name="loader" class="animate-spin text-7xl m-0" />
				</template>
				<template v-else>
					<NuxtIcon name="prev" class="text-[2rem] cursor-pointer" />
					<NuxtIcon :name="isPlaying ? 'pause' : 'play'" @click="togglePlay"
						class="ml-2 text-5xl  cursor-pointer" />
					<NuxtIcon name="next" class="text-[2rem] cursor-pointer" />
				</template>
			</div>
			<Slider :min="0" :max="duration" :tracks="tracks" @trackUpdate="changeSeek"
				class="row-start-2 col-start-1 col-span-3 self-end" />
			<div class="row-start-3 col-start-1 col-span-2 justify-start self-end flex items-center gap-4">
				<NuxtIcon name="volume" class="text-[2rem] cursor-pointer" />
				<Slider :tracks="[{ value: 0.5, color: 'bg-slate-200' }]" class="w-24" />
				<span class="font-mono">{{ timeFormat(currentTime) }} / {{ timeFormat(duration) }}</span>
			</div>
			<div class="relative row-start-3 col-start-3 justify-end self-end flex items-center gap-6">
				<NuxtIcon name="subtitle" class="text-[2rem] cursor-pointer" />
				<NuxtIcon name="sound-settings" class="text-[2rem] cursor-pointer" />
				<NuxtIcon name="video-settings" class="text-[2rem] cursor-pointer" @click="toggleDropdown('video')" />
				<NuxtIcon :name="isFullscreen ? 'screen-min' : 'screen-max'" @click="toggleFullscreen"
					class="text-[2rem] cursor-pointer" />
			</div>
			<dialog :open="dropdown !== null"
				class="top-1/2 -translate-y-[calc(50%+1.25rem)] px-0 py-1 w-56 bg-slate-200 rounded-md shadow-lg">
				<ul v-if="dropdown === 'video'" class="drop-down flex flex-col">
					<li>
						<div>
							<NuxtIcon name="keyframes" class="text-2xl" />
							<span>FPS</span>
						</div>
						<span>60 fps</span>
					</li>
					<li>
						<div>
							<NuxtIcon name="mountain" class="text-2xl" />
							<span>Color</span>
						</div>
						<span>HDR</span>
					</li>
					<li @click="toggleDropdown('video-playback')">
						<div>
							<NuxtIcon name="speed" class="text-2xl" />
							<span>Playback</span>
						</div>
						<span>{{ currentPlaybackRate }}x</span>
					</li>
					<li @click="toggleDropdown('video-resolution')">
						<div>
							<NuxtIcon name="downscale" class="text-2xl" />
							<span>Resolution</span>
						</div>
						<span>{{ isAuto ? 'Auto' : '' }} {{ resolutions[quality + 1] }}</span>
					</li>
				</ul>
				<ul v-else-if="dropdown === 'video-playback'" class="drop-down flex-col">
					<li v-for="playbackRate in [0.5, 0.75, 1, 1.25, 2]" :key="playbackRate"
						:class="{ 'highlight': playbackRate === currentPlaybackRate }"
						@click="changePlaybackRate(playbackRate)">
						{{ playbackRate }}
					</li>
				</ul>
				<ul v-else-if="dropdown === 'video-resolution'" class="drop-down flex flex-col-reverse">
					<li v-for="resolution in resolutions" :key="resolution"
						:class="{ 'highlight': resolution === (isAuto ? 'Auto' : resolutions[quality + 1]) }"
						@click="changeQuality(resolution)">
						{{ resolution }}
					</li>
				</ul>
			</dialog>
		</section>
	</main>
</template>

<style>
section {
	color: white;
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