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
const video = ref<HTMLVideoElement>(null)

watchEffect(() => {
	if (video.value)
		video.value.srcObject = (props.stream as MediaStream)
})
</script>

<template>
	<div
		class="w-full pc:min-w-[16rem] max-w-[calc(50vw-0.75rem)] md:max-w-[24vw] aspect-[3/2] md:aspect-[5/3] bg-slate-200 rounded-lg overflow-hidden">
		<video ref="video" autoplay :muted="local ? true : !audio" playsinline class="w-full h-full object-cover" />
	</div>
</template>