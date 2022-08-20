<script setup lang="ts">
import { useMedia } from '../stores/media';
import { usePlayer } from '../stores/player';
import { useUser } from '../stores/user';
import { formatTime } from '~/utils/time';

interface Media {
	videography: "Live-Action" | "Animation",
	title: string,
	langs: { subtitle: string[], audio: string[] },
	genres: string[],
	description: string,
	cast: string[],
	directors: string[],
	release: { data: Date, status: "Upcoming" | "Released" }
	episodes: string,
	production: string,
	duration: number,
	rating: number[],
	views: number
}

interface Room {
	id: string;
	call: string;
	chat: {
		audio: boolean;
		video: boolean;
		id: string;
	}[];
	player: {
		episode: number;
		buffer: "load" | "empty";
		playback: "play" | "pause";
		playbackRate: number;
		seek: number;
	}
}

const config = useRuntimeConfig()
const media = useMedia()
const user = useUser()
const player = usePlayer()
const container = ref<HTMLVideoElement>(null)

const { data: meta } = await useFetch<{ type: string, id: string }>(`${config.public.apiURL}/media/latest`)
media.init(meta.value.type, meta.value.id)

const { data: info } = await useFetch<Media>(`${config.public.apiURL}/media/${media.type}/${media.id}`)
media.title = info.value.title
media.episodes = info.value?.episodes ? info.value?.episodes : [1]
console.log("Media Info", media.type, media.id, media.title, media.episodes);

const { data: room } = await useFetch<Room>(`${config.public.apiURL}/room`)
const { episode, buffer, playback, playbackRate, seek } = room.value.player
console.log("Room info", episode, buffer, playback, playbackRate, seek);
player.init(episode, buffer, playback, playbackRate, seek)

const participants = [
	{
		id: "1",
		avatar: `https://avatars.dicebear.com/api/adventurer/${1}.svg?r=50`
	},
	{
		id: "2",
		avatar: `https://avatars.dicebear.com/api/adventurer/${2}.svg?r=50`
	},
	{
		id: "3",
		avatar: `https://avatars.dicebear.com/api/adventurer/${3}.svg?r=50`
	}
]

const { audioOutputs: speakers, audioInputs: microphones, videoInputs: cameras } = useDevicesList({
	requestPermissions: true,
	constraints: {
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
		},
		video: {
			width: { min: 640, ideal: 800, max: 854 },
			height: { min: 360, ideal: 450, max: 480 }
		}
	},
	onUpdated() {
		if (!speakers.value.find(i => i.deviceId === user.currentSpeakerId))
			user.setSpeaker(speakers.value[0]?.deviceId)

		if (!microphones.value.find(i => i.deviceId === user.currentMicrophoneId))
			user.setMicrophone(microphones.value[0]?.deviceId)

		if (!cameras.value.find(i => i.deviceId === user.currentCameraId))
			user.setCamera(cameras.value[0]?.deviceId)
	},
})

const { audioDeviceId: microphoneId, videoDeviceId: cameraId, enabled: streaming, stream } = useUserMedia({
	audioDeviceId: user.currentMicrophoneId,
	videoDeviceId: user.currentCameraId
})

watchEffect(() => {
	if (container.value && stream.value)
		container.value.srcObject = stream.value
})

onMounted(async () => {
	streaming.value = true
})

onBeforeUnmount(() => {
	streaming.value = false
})
</script>

<template>
	<main class="flex flex-col justify-between gap-4 px-4 pb-4 min-h-screen text-black">
		<img :src="`${config.public.apiURL}/public/${media.type}/${media.id}/Portrait.jpg`"
			class="rounded-b-[2rem] object-cover" />
		<section>
			<h1 class="text-2xl font-head">{{ info.title }}</h1>
			<div class="flex items-center gap-2 text-xs mt-[2px] mb-[10px]">
				<span>{{ formatTime(info.duration, false) }}</span>
				&bull;
				<span>{{ useDateFormat(info.release.data, 'YYYY').value }}</span>
			</div>
			<ul class="flex items-center gap-2 text-[10px]">
				<li v-for="genre in info.genres.slice(0, 3)" :key="genre"
					class="rounded-full px-[10px] py-1 text-center bg-slate-300 whitespace-nowrap">
					{{ genre }}
				</li>
			</ul>
		</section>
		<section class="relative">
			<video ref="container" muted autoplay playsinline class="rounded-xl w-full aspect-video object-cover" />
			<ul
				class="absolute bottom-0 left-0 right-0 grid grid-cols-[repeat(2,min-content)_auto_min-content] gap-4 m-3">
				<li class="rounded-full p-2 bg-slate-300 cursor-pointer">
					<NuxtIcon :name="user.audio ? 'microphone' : 'microphone-off'" class="text-2xl" />
				</li>
				<li class="rounded-full p-2 bg-slate-300 cursor-pointer">
					<NuxtIcon :name="user.video ? 'camera' : 'camera-off'" class="text-2xl" />
				</li>
				<li class="col-start-4 rounded-full p-2 bg-slate-300 cursor-pointer justify-self-end">
					<NuxtIcon name="gear" class="text-2xl" />
				</li>
			</ul>
			<dialog>
			</dialog>
			<!-- <div class="flex gap-2"> -->
			<!-- <ul>
				<li class="text-center">Speaker</li>
				<li v-for="audioOutput in speakers"
					:class="{ 'text-blue-500': user.currentSpeakerId === audioOutput.deviceId }"
					@click="user.setSpeaker(audioOutput.deviceId)">
					{{ audioOutput.label }}
				</li>
			</ul>
			<ul>
				<li class="text-center">Microphone</li>
				<li v-for="audioInput in microphones"
					:class="{ 'text-blue-500': user.currentMicrophoneId === audioInput.deviceId }"
					@click="user.setMicrophone(audioInput.deviceId)">
					{{ audioInput.label }}
				</li>
			</ul>
			<ul>
				<li class="text-center">Camera</li>
				<li v-for="videoInput in cameras"
					:class="{ 'text-blue-500': user.currentCameraId === videoInput.deviceId }"
					@click="user.setCamera(videoInput.deviceId)">
					{{ videoInput.label }}
				</li>
			</ul> -->
			<!-- </div> -->
		</section>
		<section class="flex">
			<div v-for="(participant, index) in participants" class="rounded-full p-[6px] bg-slate-300 overflow-hidden"
				:class="{ '-ml-6': index !== 0 }">
				<img :src="participant.avatar" :alt="participant.id" class="w-12 md:w-14 lg:w-20 aspect-square" />
			</div>
		</section>
		<NuxtLink to="/watch"
			class="fixed bottom-0 right-0 flex gap-[6px] items-center rounded-tl-full pl-7 pr-6 pt-3 pb-2 text-white bg-blue-500">
			<NuxtIcon name="plus" class="text-2xl" />Join
		</NuxtLink>
	</main>
</template>