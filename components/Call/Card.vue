<script setup lang="ts">
const props = defineProps({
	fullscreen: {
		type: Boolean,
		default: false
	},
	local: {
		type: Boolean,
		required: true
	},
	name: {
		type: String,
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

const isMuted = computed(() => {
	return props.local ? true : !props.audio
})
const container = ref<HTMLVideoElement>(null)

watchEffect(() => {
	if (container.value && props.stream) {
		const stream = (props.stream as MediaStream)
		container.value.srcObject = stream
		container.value.volume = 0.5
	}
})
</script>

<template>
	<div
		class="grid grid-rows-[3fr_3fr_2fr] grid-cols-[8fr_15fr_25fr] justify-items-center items-center w-full max-w-[calc(50vw-0.75rem)] md:max-w-[24vw] rounded-lg bg-slate-200 aspect-[3/2] md:aspect-[5/3] overflow-hidden">
		<div class="row-start-1 row-span-3 col-start-1 col-span-3 p-[6px] rounded-full bg-slate-300 overflow-hidden">
			<img :src="avatar" alt="avatar" class="w-12 md:w-14 lg:w-20" />
		</div>
		<video ref="container" autoplay :muted="isMuted" playsinline
			class="row-start-1 row-span-3 col-start-1 col-span-3 w-full h-full object-cover" />
		<span v-if="!fullscreen" class="row-start-3 col-start-1 m-1 rounded-full p-1 pc:p-[6px] bg-slate-300">
			<NuxtIcon :name="audio ? 'microphone' : 'microphone-off'" class="text-base pc:text-2xl text-black" />
		</span>
		<span v-if="!fullscreen"
			class="row-start-3 col-start-3 m-1 rounded-full px-3 py-1 w-fit text-xs pc:text-base whitespace-nowrap bg-slate-300">
			{{ name }}
		</span>
	</div>
</template>