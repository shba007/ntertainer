<script setup lang="ts">
export interface Participant {
	id: string;
	local: boolean,
	name: { first: string; last: string };
	audio: boolean;
	video: boolean;
	stream: MediaStream;
}

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
const videoContainer = ref<HTMLVideoElement>(null)

watchEffect(() => {
	if (videoContainer.value && props.stream) {
		const stream = (props.stream as MediaStream)
		videoContainer.value.srcObject = stream
	}
})
</script>

<template>
	<div
		class="grid grid-rows-3 grid-cols-[8fr_15fr_25fr] justify-items-center items-center w-full max-w-[calc(50vw-0.75rem)] md:max-w-[24vw] rounded-lg bg-slate-200 aspect-[3/2] md:aspect-[5/3] overflow-hidden">
		<video v-if="video" ref="videoContainer" autoplay :muted="isMuted" playsinline
			class="row-start-1 row-span-full col-start-1 col-span-3 w-full h-full object-cover" />
		<div v-else
			class="row-start-2 col-start-1 col-span-3 self-center p-[6px] rounded-full bg-slate-300 overflow-hidden">
			<img :src="avatar" alt="avatar" class="w-12 md:w-16" />
		</div>
		<NuxtIcon v-if="!fullscreen" :name="audio ? 'microphone' : 'microphone-off'"
			class="row-start-3 col-start-1 m-2 text-lg pc:text-2xl" :class="audio ? 'text-blue-500' : 'text-red-600'" />
		<span v-if="!fullscreen"
			class="row-start-3 col-start-3 rounded-full m-2 px-3 py-1 w-fit text-xs pc:text-base whitespace-nowrap bg-slate-200">
			{{ name }}
		</span>
	</div>
</template>