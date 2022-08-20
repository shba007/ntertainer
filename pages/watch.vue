<script setup lang="ts">
import { useMedia } from '../stores/media';
import { usePlayer } from '../stores/player';
import { Participant } from '../components/Call/Card.vue.js';

const media = useMedia()
const player = usePlayer()
const container = ref<HTMLElement>(null)

const controls = ref<boolean>(true)
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

const pinnedParticipant = ref<Participant>(null)

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

// Call Life Cycle Hooks
function onPinStream(participant: Participant) {
	pinnedParticipant.value = participant
}
</script>

<template>
	<div class="flex flex-col md:flex-row gap-2 px-2 py-4 h-screen md:h-auto">
		<section ref="container" class="w-full md:h-full aspect-video">
			<CallControls v-show="controls"
				class="fixed left-0 top-1/2 invisible landscape:visible -translate-y-[calc(50%+1.25rem)] z-10" />
			<CallCard v-if="!!pinnedParticipant" v-show="isFullscreen && controls" :fullscreen="true"
				:local="pinnedParticipant.local" :name="pinnedParticipant.name.first" :audio="pinnedParticipant.audio"
				:video="pinnedParticipant.video" :stream="pinnedParticipant.stream"
				class="fixed right-2 top-2 md:right-4 md:top-4 invisible landscape:visible z-10" />
			<ClientOnly placeholder="Loading...">
				<LazyVideoPlayer :autoplay="player.playback == 'play'" :type="media.type" :id="media.id"
					:episode="player.episode" @update:fullscreen="onFullscreen"
					@update:controls="(value) => controls = value"
					@update:episode="(episode) => player.episode = episode" />
			</ClientOnly>
		</section>
		<section class="flex-grow md:hidden">
			<h2>{{ media.title }}</h2>
		</section>
		<CallMenu @update:pinParticipant="onPinStream" />
		<CallControls class="w-full md:hidden" :side="false" />
	</div>
</template>