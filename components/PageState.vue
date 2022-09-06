<script lang="ts" setup>
const props = defineProps({
	pending: {
		type: Boolean,
		default: false
	},
	error: {
		type: Boolean,
		default: false
	}
})
const emits = defineEmits<{ (event: "refresh"): void }>()
</script>

<template>
	<main class="relative mx-4">
		<!-- Loading -->
		<section v-if="pending" class="flex flex-col justify-center items-center h-screen text-black">
			<!-- <NuxtIcon name="loader" class="text-5xl" /> -->
			<NuxtRive name="loader" :size="96" />
		</section>
		<!-- Error -->
		<section v-else-if="error"
			class="flex flex-col justify-center items-center h-screen text-slate-500 text-center text-lg font-medium">
			<img src="~/assets/image/error.png" alt="error" />
			<h2 class="text-2xl mb-4 font-bold">Ooops!</h2>
			<p>
				It seems that there is something wrong
				with your internet or the server
			</p>
			<button class="m-4 rounded-full px-4 pt-[2px] pb-1 text-white font-normal bg-blue-600"
				@click="emits('refresh')">
				Refresh
			</button>
		</section>
		<!-- Success -->
		<section v-else v-bind="$attrs">
			<slot />
		</section>
	</main>
</template>

<style scoped>
</style>
