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

const emits = defineEmits<{ (event: "update:playback"): void }>()
</script>

<template>
	<NuxtIcon name="prev" class="text-[2rem] pc:text-3xl cursor-pointer" :class="class" @click="media.prev()" />
	<NuxtIcon :name="playback ? 'pause' : 'play'" @click="emits('update:playback')"
		class="ml-2 pc:ml-0 text-5xl pc:text-3xl cursor-pointer" :class="class" />
	<NuxtIcon name="next" class="text-[2rem] pc:text-3xl cursor-pointer" :class="class" @click="media.next()" />
</template>