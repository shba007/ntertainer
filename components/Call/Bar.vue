<script setup lang="ts">
import { useUser } from '../../stores/user';

const user = useUser()

function disconnect() {
}
</script>

<template>
	<ul
		class="flex flex-col gap-3 pc:gap-5 pl-2 pc:pl-3 pr-[10px] pc:pr-4 py-3 pc:py-4 rounded-l-sm rounded-r-2xl bg-slate-200">
		<li class="cursor-pointer" @click="disconnect">
			<NuxtIcon name="phone" class="text-2xl pc:text-3xl" />
		</li>
		<li class="cursor-pointer" @click="user.toggleAudio">
			<NuxtIcon :name="user.audio ? 'microphone' : 'microphone-off'" class="text-2xl pc:text-3xl" />
		</li>
		<li class="cursor-pointer" @click="user.toggleVideo">
			<NuxtIcon :name="user.video ? 'camera' : 'camera-off'" class="text-2xl pc:text-3xl" />
		</li>
	</ul>
</template>