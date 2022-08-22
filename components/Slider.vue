<script setup lang="ts">
import { PropType } from "vue";
import { useClamp } from '@vueuse/math'

const props = defineProps({
	min: { type: Number, default: 0 },
	max: { type: Number, default: 1 },
	tracks: { type: Array as PropType<Array<{ value: number, color: string }>>, required: true },
	disabled: { type: Boolean, default: false }
})
const emits = defineEmits<{ (event: "update:tracks", time: number): void }>()

const bar = ref<HTMLDivElement>(null)
const thumb = ref<HTMLDivElement>(null)
const { width: barWidth } = useElementBounding(bar)
const { width: thumbWidth } = useElementBounding(thumb)
const { elementX: barRelativeX } = useMouseInElement(bar)
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

function calculateXPosition(): void {
	const delta = barRelativeX.value / barWidth.value
	emits("update:tracks", interpolate(delta, props.min, props.max))
}

function onDeviceDown() {
	isDrag.value = false
}
function onDeviceMove() {
	if (isDrag.value === null)
		return

	if (!isDrag.value) {
		isDrag.value = true
		console.debug("Drag Started");
	}

	calculateXPosition()
}
function onDeviceUp() {
	if (isDrag.value !== null) {
		if (!isDrag.value) {
			console.debug("Clicked");
			calculateXPosition()
		} else {
			console.debug("Drag Ended");
		}
	}

	isDrag.value = null
}

useEventListener(window, "touchmove", useThrottleFn(onDeviceMove, 100))
useEventListener(window, "mousemove", useThrottleFn(onDeviceMove, 100))
useEventListener(window, "touchend", onDeviceUp)
useEventListener(window, "mouseup", onDeviceUp)
</script>

<template>
	<div class="relative flex items-center w-full cursor-pointer py-1" @touchstart.passive="onDeviceDown"
		@mousedown="onDeviceDown">
		<div ref="bar" class="relative w-full h-1 bg-slate-200/40 rounded-full overflow-hidden">
			<div v-for="(track, id) in tracks"
				class="track absolute left-0 right-0 top-0 bottom-0 origin-[left_center] rounded-full transition-transform duration-100 ease-out"
				:class="track.color" :style="trackStyles[id]" />
		</div>
		<div ref="thumb"
			class="thumb absolute left-0 w-4 h-4 rounded-full shadow transition-transform duration-100 ease-out"
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