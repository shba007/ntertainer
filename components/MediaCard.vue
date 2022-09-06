<script lang="ts" setup>
import { formatTime, calculateRating, trim } from '~/utils/helpers';

const config = useRuntimeConfig()

const props = defineProps(['media'])

const type = ref<string>(props.media.type)
const id = ref<string>(props.media.id)
const title = ref<string>(props.media.title)
const release = ref<{ date: string, status: "released" | "upcoming" }>(props.media.release)
const genres = ref<string[]>(props.media.genres)
const duration = ref<number>(props.media.duration)
const episodes = ref<string[]>(props.media.episodes)
const rating = ref<number[]>(props.media.rating)
const views = ref<number>(props.media.views)

const isSequel = computed(() => type.value === "erotica" || type.value === "movie")
const seriesId = computed(() => id.value.split("-")[1])
const poster = computed(() => `${config.public.apiURL}/public/${type.value}/${id.value}/Portrait.avif`)
</script>

<template>
	<div
		class="relative grid grid-rows-[auto_min-content_min-content] grid-cols-[min-content_auto] rounded-2xl w-full aspect-[9/16] bg-slate-200 overflow-hidden">
		<NuxtLink :to="`/lobby?type=${type}&id=${id}`"
			class="relative row-start-1 row-span-2 col-start-1 col-span-2 flex justify-center items-center">
			<NuxtIcon name="image" class="text-5xl" />
			<img :src="poster" alt="poster" class="absolute top-0 left-0 w-full h-[115%] object-cover" />
		</NuxtLink>
		<div
			class="row-start-2 col-start-1 flex gap-1 justify-center items-center m-[6px] rounded-2xl pl-[6px] pr-2 p py-1 bg-slate-300 z-10">
			<NuxtIcon name="star" />
			<span class="text-xs font-semibold">{{ calculateRating(rating) }}</span>
			<span class="text-[10px]">|</span>
			<span class="text-[10px]">{{ views }}</span>
		</div>
		<div class="relative col-span-2 rounded-tr-3xl p-2 text-white bg-sky-500 z-10">
			<span>{{ trim(title, 13) }}</span>
			<ul class="flex gap-1 mt-0 mb-1 text-[10px]">
				<li>{{ useDateFormat(release.date, 'YYYY').value }}</li>
				<li>&middot;</li>
				<li>S {{ seriesId }}</li>
				<li>&middot;</li>
				<li>{{ isSequel ? formatTime(duration, false) : `Episodes ${episodes.length}` }}</li>
			</ul>
			<!-- TODO: Horizontal Scrollable -->
			<div class="relative w-full h-[19px] overflow-x-auto overscroll-contain">
				<ul class="absolute flex gap-1 text-[10px]">
					<li v-for="genre in genres"
						class="block rounded-full px-2 py-[2px] text-black bg-slate-300 cursor-default">
						{{ genre }}
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style scoped>
* {
	-ms-overflow-style: none;
	scrollbar-width: none;
}

*::-webkit-scrollbar {
	display: none;
}
</style>