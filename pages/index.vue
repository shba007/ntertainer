<script setup lang="ts">
import { useUser } from '~/stores/user';
import { Media } from '~/utils/models';

useHead({
	title: "Ntertainer - Explore"
})
// FIXME: Video is flickering during playback only on mobile
// FIXME: Player init takes long time, seekStamp fix when not playing
// TODO: Store media in buffer
const config = useRuntimeConfig()
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
const selectedCategory = ref(1)
const { pending, error, data: medias, refresh } = await useLazyFetch<Media[]>(() => `media/${categories[selectedCategory.value].key}`, { baseURL: config.public.apiURL })

function changeCategory(category: number) {
	selectedCategory.value = category
}
// FIXME: enable/disable streaming depending on route
onBeforeMount(() => {
	user.disableStreaming()
})

onBeforeUnmount(() => {
	user.enableStreaming()
})
</script>

<template>
	<PageState :pending="pending" :error="!!error" @refresh="refresh" class="relative mt-4 text-black">
		<header class="flex flex-col">
			<span>Total Content {{ medias.length }}</span>
		</header>
		<ul class="flex justify-between">
			<li v-for="(category, index) in categories" class="rounded-full px-3 py-1 text-xs cursor-pointer"
				:class="[selectedCategory == index ? 'bg-pink-600 text-white' : 'bg-slate-300 text-black']"
				@click="changeCategory(index)">
				{{ category.title }}
			</li>
		</ul>
		<section
			class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-between justify-items-center content-start py-4 w-full min-h-[100vh]">
			<MediaCard v-for="media in medias" :key="`${media.type}_${media.id}`" :media="media" />
		</section>
	</PageState>
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