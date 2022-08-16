<script setup lang="ts">
import { useMedia } from '../stores/media';

const media = useMedia()
const props = defineProps({
	playback: {
		type: Boolean,
		default: false
	}, class: {
		type: String,
		default: ""
	}
})

const emits = defineEmits<{
	(event: "update:playback"): void,
	(event: "update:episode", action: 'prev' | 'next'): void
}>()

</script>

<template>
	<button class="text-[2rem] pc:text-3xl disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
		:class="class" :disabled="media.episode.current <= 1" @click="emits('update:episode', 'prev')">
		<NuxtIcon name="prev" />
	</button>
	<button class="ml-2 pc:ml-0 text-5xl pc:text-3xl cursor-pointer" :class="class" @click="emits('update:playback')">
		<NuxtIcon :name="playback ? 'pause' : 'play'" />
	</button>
	<button class="text-[2rem] pc:text-3xl disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
		:class="class" :disabled="media.episode.current >= media.episode.total"
		@click="emits('update:episode', 'next')">
		<NuxtIcon name="next" />
	</button>
</template>