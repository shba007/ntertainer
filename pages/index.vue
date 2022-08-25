<script setup lang="ts">
import { useUser } from '~/stores/user';
import { Media } from "./lobby.vue";

const config = useRuntimeConfig()
// FIXME: SpaceBar causes to return prev page only on vivaldi
// FIXME: Video is flickering during play only on mobile
// TODO: Add seek and timestamp and calculate seektime

const user = useUser()
const categories = [
	{
		title: 'Erotica',
		key: 'erotica'
	},
	{
		title: 'Movie',
		key: 'movie'
	},
	{
		title: 'TV Series',
		key: 'tv-series'
	},
	{
		title: 'Web Series',
		key: 'web-series'
	}
]
const selectedCategory = ref<number>()
const medias = ref<Media>()

watch(selectedCategory, async () => {
	const { data } = await useFetch<Media>(`${config.public.apiURL}/media/${categories[selectedCategory.value].key}`, { initialCache: false })
	medias.value = data.value
})

// FIXME: enable/disable streaming depending on route
onBeforeMount(() => {
	user.disableStreaming()
	selectedCategory.value = 1
})

onBeforeUnmount(() => {
	user.enableStreaming()
})
</script>

<template>
	<main class="relative p-4 text-black">
		<header class=""></header>
		<ul class="flex justify-between">
			<li v-for="(category, index) in categories" class="rounded-full px-3 py-1 bg-slate-300 text-xs"
				@click="selectedCategory = index">
				{{ category.title }}
			</li>
		</ul>
		<section class="grid grid-cols-2 gap-4 justify-between justify-items-center content-start py-4 min-h-[100vh]">
			<MediaCard v-for="media in medias" :media="media" />
		</section>
	</main>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500&family=League+Spartan:wght@300;400;500&family=Poppins:wght@300;400;500;700&display=swap");

* {
	@apply font-body;
	-webkit-tap-highlight-color: transparent;
}

.nuxt-icon svg {
	margin: 0 !important;
}
</style>