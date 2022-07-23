<script setup lang="ts">
const props = defineProps({
	local: {
		type: Boolean,
		required: true
	},
	audio: {
		type: Boolean,
		required: true
	},
	video: {
		type: Boolean,
		required: true
	},
	stream: {
		// type: MediaStream,
		required: true
	}
})
const seed = (Math.random() + 1).toString(36).substring(7)
const avatar = ref(`https://avatars.dicebear.com/api/adventurer/${seed}.svg?r=50`)
const video = ref<HTMLVideoElement>(null)

watchEffect(() => {
	if (video.value)
		video.value.srcObject = (props.stream as MediaStream)
})
</script>

<template>
	<div
		class="grid grid-rows-3 grid-cols-3 w-full max-w-[calc(50vw-0.75rem)] md:max-w-[24vw] rounded-lg bg-slate-200 aspect-[3/2] md:aspect-[5/3] overflow-hidden">
		<span class="row-start-2 col-start-2 self-center p-[6px] rounded-full bg-slate-300 overflow-hidden">
			<img :src="avatar" alt="avatar" class="w-fit" />
		</span>
		<video ref="video" autoplay :muted="local ? true : !audio" playsinline
			class="row-start-1 row-span-full col-start-1 col-span-full w-full h-full object-cover" />
	</div>
</template>