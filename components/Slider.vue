<script setup lang="ts">
import { PropType } from "vue";

const props = defineProps({
	min: { type: Number, default: 0 },
	max: { type: Number, default: 1 },
	tracks: { type: Array as PropType<Array<{ value: number, color: string }>>, required: true },
	disabled: { type: Boolean, default: false }
})
const emits = defineEmits<{ (event: "update:tracks", time: number): void }>()

const bar = ref<HTMLDivElement>(null)
const thumb = ref<HTMLDivElement>(null)
const barWidth = ref(0)
const thumbWidth = ref(0)
const isDrag = ref<Boolean>(null)

const deltas = computed(() => {
	const deltas = []
	for (const track of props.tracks) {
		let delta = props.max !== 0 ? useClamp(track.value / props.max, 0, 1).value : 0
		deltas.push(delta)
	}
	return deltas
})
const trackStyles = computed(() => {
	const styles = []
	for (const id of props.tracks.keys()) {
		const style = { transform: `scaleX(${deltas.value[id] + (thumbWidth.value / barWidth.value) * 0.5})`, zIndex: `${props.tracks.length - id}` }
		styles.push(style)
	}
	return styles
})
const thumbStyle = computed(() => {
	const thumbOffset = barWidth.value * deltas.value[0] - thumbWidth.value * 0.5
	return { transform: `translateX(${thumbOffset}px)`, zIndex: props.tracks.length }
})

function interpolate(value: number, lowerLimit = 0, higherLimit = 1) {
	return value * (higherLimit - lowerLimit) + lowerLimit
}

function calculateDimensions() {
	barWidth.value = bar.value.offsetWidth
	thumbWidth.value = thumb.value.offsetWidth
}
function calculateXPosition(event: any): void {
	let relativeX = 0
	let { left: elementOffsetX } = bar.value.getBoundingClientRect()

	if (event.type === "mousemove" || event.type === "mouseup") {
		relativeX = useClamp(event.clientX - elementOffsetX, 0, barWidth.value).value
	} else if (event.type === "touchmove" || event.type === "touchend") {
		relativeX = useClamp(event.touches[0].clientX - elementOffsetX, 0, barWidth.value).value
	}

	const delta = relativeX / barWidth.value
	emits("update:tracks", interpolate(delta, props.min, props.max))
}

function onDeviceDown() {
	isDrag.value = false
}
function onDeviceMove(event) {
	if (isDrag.value === null)
		return

	if (!isDrag.value) {
		isDrag.value = true
		console.debug("Drag Started");
	}

	calculateXPosition(event)
}
function onDeviceUp(event) {
	if (isDrag.value !== null) {
		if (!isDrag.value) {
			console.debug("Clicked");
			calculateXPosition(event)
		} else {
			console.debug("Drag Ended");
		}
	}
	isDrag.value = null
}

useEventListener(window, "resize", useThrottleFn(calculateDimensions, 200))
useEventListener(window, "mousemove", useThrottleFn(onDeviceMove, 100))
useEventListener(window, "touchmove", useThrottleFn(onDeviceMove, 100))
useEventListener(window, "mouseup", onDeviceUp)

onMounted(() => {
	calculateDimensions()
})
</script>

<template>
	<div class="relative flex items-center w-full cursor-pointer py-1" @mousedown="onDeviceDown"
		@touchstart="onDeviceDown">
		<div ref="bar" class="relative w-full h-1 bg-slate-200/40 rounded-full overflow-hidden">
			<div v-for="(track, id) in tracks"
				class="absolute left-0 right-0 top-0 bottom-0 origin-[left_center] rounded-full transition-transform duration-200 ease-out"
				:class="track.color" :style="trackStyles[id]" />
		</div>
		<div ref="thumb" class="absolute left-0 w-4 h-4 rounded-full shadow transition-transform duration-200 ease-out"
			:class="tracks[0].color" :style="thumbStyle" />
	</div>
</template>

<style scoped>
div {
	/* user-drag: none; */
	-webkit-user-drag: none;
	user-select: none;
	-moz-user-select: none;
	-webkit-user-select: none;
	-ms-user-select: none;
}
</style>