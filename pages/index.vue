<script setup lang="ts">
const mediaMeta = ref({ type: "erotica", id: "111-1" })
const media = await queryContent(mediaMeta.value.type, mediaMeta.value.id).only(["title"]).findOne()
const poster = `/media/${mediaMeta.value.type}/${mediaMeta.value.id}/Landscape.jpg`
const src = `/media/${mediaMeta.value.type}/${mediaMeta.value.id}/1/manifest.mpd`

const buffer = ref<"load" | "empty">(null)
const playback = ref<"play" | "pause">(null)
const playbackRate = ref<number>(null)
const seek = ref<number>(null)

function onBuffer(state: "load" | "empty", time: number) {
	console.debug(`Child Buffer ${state} at ${time}`);
}
function onPlayback(state: "play" | "pause", time: number) {
	console.debug(`Child Playback ${state} at ${time}`);
}
function onPlaybackRate(rate: number, time: number) {
	console.debug(`Child PlaybackRate ${rate} at ${time}`);
}
function onSeek(time: number) {
	console.debug(`Child Seek to ${time}`);
}

</script>

<template>
	<div class="relative w-screen h-screen">
		<BarCall class="absolute left-0 top-1/2 -translate-y-[calc(50%+1.25rem)] z-10" />
		<ClientOnly placeholder="Loading...">
			<LazyVideoPlayer :title="media.title" :poster="poster" :src="src" :autoplay="false" @update:overlay=""
				:buffer="buffer" :playback="playback" :playbackRate="playbackRate" :seek="seek"
				@update:buffer="onBuffer" @update:playback="onPlayback" @update:playbackRate="onPlaybackRate"
				@update:seek="onSeek" />
		</ClientOnly>
	</div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500&family=League+Spartan:wght@300;400;500&family=Poppins:wght@300;400;500;700&display=swap");

* {
	-webkit-tap-highlight-color: transparent;
	@apply font-body;
}

.nuxt-icon svg {
	margin: 0 !important;
}
</style>