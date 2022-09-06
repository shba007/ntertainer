<script lang="ts" setup>
import { Alignment, Fit, Layout, Rive } from "@rive-app/canvas";

const props = defineProps({
	name: {
		type: String,
		required: true
	}, size: {
		type: Number,
		required: true
	}, autoplay: {
		type: Boolean,
		default: true
	}
})

const canvas = ref<HTMLCanvasElement>()

onMounted(() => {
	// Rive Initialization
	new Rive({
		src: `/animation/${props.name}.riv`,
		canvas: canvas.value,
		autoplay: props.autoplay,
		layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
	})
})
</script>

<template>
	<canvas ref="canvas" :width="size" :height="size" />
</template>
