<script setup lang="ts">
import { useUser } from '~/stores/user';

const props = defineProps({
	side: {
		type: Boolean,
		default: true
	}
})

const user = useUser()
// TODO: Disconnect
function disconnect() {
}
</script>

<template>
	<section>
		<!-- Side Bar -->
		<ul v-if="side"
			class="flex flex-col gap-3 pc:gap-5 pl-2 pc:pl-3 pr-[10px] pc:pr-4 py-3 pc:py-4 rounded-l-sm rounded-r-2xl bg-slate-200">
			<li class="cursor-pointer" @click="disconnect">
				<NuxtIcon name="phone" class="text-2xl pc:text-3xl" />
			</li>
			<li class="cursor-pointer" @click="user.toggleMicrophone">
				<NuxtIcon :name="user.audio ? 'microphone' : 'microphone-off'" class="text-2xl pc:text-3xl" />
			</li>
			<li class="cursor-pointer" @click="user.toggleCamera">
				<NuxtIcon :name="user.video ? 'camera' : 'camera-off'" class="text-2xl pc:text-3xl" />
			</li>
		</ul>
		<!-- Bottom bar -->
		<ul v-else class="flex gap-8 mx-auto w-fit">
			<li class="rounded-full p-3 bg-slate-300 cursor-pointer" @click="user.toggleMicrophone">
				<NuxtIcon :name="user.audio ? 'microphone' : 'microphone-off'" class="text-3xl" />
			</li>
			<li class="rounded-full p-3 bg-slate-300 cursor-pointer" @click="disconnect">
				<NuxtIcon name="phone" class="text-3xl" />
			</li>
			<li class="rounded-full p-3 bg-slate-300 cursor-pointer" @click="user.toggleCamera">
				<NuxtIcon :name="user.video ? 'camera' : 'camera-off'" class="text-3xl" />
			</li>
		</ul>
	</section>
</template>