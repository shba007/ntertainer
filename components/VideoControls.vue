<script setup lang="ts">
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
	<NuxtIcon name="prev" class="text-[2rem] pc:text-3xl cursor-pointer" :class="class" />
	<NuxtIcon :name="playback ? 'pause' : 'play'" @click="emits('update:playback')"
		class="ml-2 text-5xl pc:text-3xl cursor-pointer" :class="class" />
	<NuxtIcon name="next" class="text-[2rem] pc:text-3xl cursor-pointer" :class="class" />
</template>