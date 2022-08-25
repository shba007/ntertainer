<script lang="ts" setup>
import { formatTime, calculateRating, trim } from '~/utils/helpers';

const config = useRuntimeConfig()

const props = defineProps(['media'])

const type = ref<string>(props.media.type)
const id = ref<string>(props.media.id)
const title = ref<string>(props.media.title)
const duration = ref<number>(props.media.duration)
const release = ref<{ date: string, status: "released" | "upcoming" }>(props.media.release)
const genres = ref<string[]>(props.media.genres)
const rating = ref<number[]>(props.media.rating)
const views = ref<number>(props.media.views)

const poster = computed(() => `${config.public.apiURL}/public/${type.value}/${id.value}/Portrait.avif`)
</script>

<template>
	<div
		class="grid grid-rows-[auto_min-content_min-content] grid-cols-[min-content_auto] rounded-2xl w-full aspect-[9/16] bg-slate-200 overflow-hidden">
		<NuxtLink :to="`/lobby?type=${type}&id=${id}`"
			class="relative row-start-1 row-span-2 col-start-1 col-span-2 flex justify-center items-center">
			<NuxtIcon name="image" class="text-5xl" />
			<img :src="poster" class="absolute top-0 bottom-0 left-0 right-0 object-cover" />
		</NuxtLink>
		<div
			class="row-start-2 col-start-1 flex gap-1 justify-center items-center m-[6px] rounded-2xl pl-[6px] pr-2 p py-1 bg-slate-300 z-10">
			<NuxtIcon name="star" />
			<span class="text-xs font-semibold">{{ calculateRating(rating) }}</span>
			<span class="text-[10px]">|</span>
			<span class="text-[10px]">{{ views }}</span>
		</div>
		<div class="col-span-2 p-2 rounded-tr-3xl text-white bg-pink-600 z-10">
			<span>{{ trim(title, 13) }}</span>
			<ul class="flex gap-1 mt-0 mb-1 text-[10px]">
				<li class="capitalize">{{ type }}</li>
				&middot;
				<li>{{ formatTime(duration, false) }}</li>
				&middot;
				<li>{{ useDateFormat(release.date, 'YYYY').value }}</li>
			</ul>
			<ul class="flex gap-1 text-[10px] ">
				<li v-for="genre in genres" class="rounded-full px-2 py-[2px] text-black bg-slate-300">
					{{ genre }}
				</li>
			</ul>
		</div>
	</div>
</template>
