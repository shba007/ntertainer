<script setup lang="ts">
import { useUser } from '~/stores/user';
import { Media } from '~/utils/models';

const config = useRuntimeConfig()
// FIXME: SpaceBar causes to return prev page only on vivaldi
// FIXME: Video is flickering during play only on mobile
// FIXME: Player init takes long time

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
	refresh()
}

// FIXME: enable/disable streaming depending on route
onBeforeMount(async () => {
	user.disableStreaming()
})

onBeforeUnmount(() => {
	user.enableStreaming()
})
</script>

<template>
	<main class="relative w-screen h-screen">
		<!-- Loading -->
		<section v-if="pending" class="flex flex-col justify-center items-center px-4 h-full text-black">
			<NuxtIcon name="loader" class="text-5xl" />
		</section>
		<!-- Error -->
		<section v-else-if="error"
			class="flex flex-col justify-center items-center px-4 h-full text-slate-500 text-center text-lg font-medium">
			<img src="~/assets/image/error.png" alt="error" />
			<h2 class="text-2xl mb-4 font-bold">Ooops!</h2>
			<p>
				It seems that there is something wrong
				with your internet or the server
			</p>
		</section>
		<!-- Success -->
		<section v-else class="relative p-4 text-black">
			<header class="flex flex-col">
				<span>Total Content {{ medias.length }}</span>
			</header>
			<ul class="flex justify-between">
				<li v-for="(category, index) in categories" class="rounded-full px-3 py-1  text-xs"
					:class="[selectedCategory == index ? 'bg-pink-600 text-white' : 'bg-slate-300 text-black']"
					@click="changeCategory(index)">
					{{ category.title }}
				</li>
			</ul>
			<section
				class="grid grid-cols-2 gap-4 justify-between justify-items-center content-start py-4 min-h-[100vh]">
				<MediaCard v-for="media in medias" :key="`${media.type}_${media.id}`" :media="media" />
			</section>
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