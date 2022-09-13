<script setup lang="ts">
const props = defineProps(['dropdown', 'color', 'resolution', 'playbackRate', 'language', 'subtitle', 'debug'])
const emits = defineEmits<{
	(event: 'update:dropdown', dropdown: null | string): void,
	(event: 'update:color', index: number): void
	(event: 'update:resolution', index: number): void
	(event: 'update:playback-rate', index: number): void
	(event: 'update:language', index: number): void
	(event: 'update:subtitle', index: number): void
	(event: 'update:debug', index: number): void
}>()

const options = computed(() => new Map([
	['color', props.color],
	['resolution', props.resolution],
	['playback-rate', props.playbackRate],
	['language', props.language],
	['subtitle', props.subtitle],
	['debug', props.debug]
]))

// Settings -> Video
const video = computed(() => [{
	dropdown: null,//"fps",
	icon: "keyframes",
	name: "FPS",
	value: "24 fps"
}, {
	dropdown: null,//"color",
	icon: "mountain",
	name: "Color",
	value: props.color?.value
}, {
	dropdown: "resolution",
	icon: "downscale",
	name: "Resolution",
	value: props.resolution?.value // ${isAuto ? 'Auto' : '' }
}, {
	dropdown: "playback-rate",
	icon: "speed",
	name: "Playback Rate",
	value: props.playbackRate?.value
},])

// Settings -> Video -> Playback
// Settings -> Video -> Color
// Settings -> Video -> FPS
// Settings -> Video -> Resolution

// Settings -> Audio
const audio = ref([{
	dropdown: null, // "channel",
	icon: "three-dots",
	name: "Channel",
	value: "Stereo"
}, {
	dropdown: null, // "bitrate",
	icon: "sine-wave",
	name: "Bitrate",
	value: "128 KHz"
}, {
	dropdown: "language",
	icon: "language",
	name: "Language",
	value: props.language?.value
}])

// Settings -> Audio -> Channel
// Settings -> Audio -> Bitrate
// Settings -> Audio -> Language

// Settings -> Subtitle
/* const subtitle = ref([{
	dropdown: null, // "bitrate",
	icon: "subtitle",
	name: "Visibility",
	value: "On"
}, {
	dropdown: "subtitle-language",
	icon: "language",
	name: "Language",
	value: props.subtitleLanguage?.value
}]) */

// Settings -> Subtitle -> Visibility
// Settings -> Subtitle -> Language

const settings = computed(() => [{
	dropdown: "video",
	icon: "play",
	name: "Video",
	value: props.resolution?.value
}, {
	dropdown: "audio",
	icon: "volume-full",
	name: "Audio",
	value: props.language?.value
}, {
	dropdown: "subtitle",
	icon: "subtitle",
	name: "Subtitle",
	value: props.subtitle?.value
}, {
	dropdown: "debug",
	icon: "stats",
	name: "Debug",
	value: props.debug?.value
}])

const menus = computed(() => new Map([
	['settings', settings.value],
	['video', video.value],
	['audio', audio.value],
	// ['subtitle', subtitle.value],
]))

const isMenu = computed(() => !!menus.value.get(props.dropdown))
const currentList = computed(() => isMenu.value ? menus.value.get(props.dropdown) : options.value.get(props.dropdown))
</script>

<template>
	<dialog :open="!!props.dropdown" v-if="!!props.dropdown"
		class="pc:left-auto pc:right-6 top-1/2 pc:top-auto pc:bottom-0 -translate-y-[calc(50%+1.25rem)] pc:-translate-y-[4.5rem] px-0 py-1 w-56 bg-slate-200 rounded-md shadow-lg overflow-y-auto">
		<ol class="drop-down flex" :class="isMenu ? 'flex-col' : 'flex-col-reverse'">
			<template v-if="isMenu">
				<li v-for="menu in currentList" @click="emits('update:dropdown',menu.dropdown)">
					<div>
						<NuxtIcon :name="menu.icon" class="text-2xl" />
						<span>{{ menu.name }}</span>
					</div>
					<span>{{ menu.value }}</span>
				</li>
			</template>
			<template v-else>
				<li v-for="(option, index) in currentList.options" class="!justify-center"
					:class="{ 'highlight': index === currentList.index }"
					@click="emits(`update:${props.dropdown as 'playback-rate'}`,index)">
					{{ option }}
				</li>
			</template>
		</ol>
	</dialog>
</template>

<style scoped>
.drop-down>li {
	@apply flex justify-between items-center px-4 py-3 text-xs cursor-pointer;
}

.drop-down>li.highlight {
	@apply bg-blue-400 text-white;
}

.drop-down>li>div {
	@apply flex items-center gap-2;
}
</style>