<script setup lang="ts">
</script>

<template>
	<div class="flex flex-col gap-4 justify-center items-center min-w-[100vw] min-h-[100vh]">
		<NuxtLink to="/lobby" class="px-4 py-2 rounded-full text-white bg-blue-500 ">
			Next
		</NuxtLink>
	</div>
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