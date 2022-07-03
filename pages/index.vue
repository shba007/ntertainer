<template>
	<div class="relative w-screen h-screen">
		<!-- <ClientOnly>
			<LazyVideoPlayer />
		</ClientOnly> -->
		<VideoPlayer />
	</div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@400;500&family=League+Spartan:wght@300;400;500&family=Poppins:wght@300;400;500;700&display=swap');

@font-face {
	font-family: 'Crash Numbering';
	src: url(~assets/fonts/crash-numbering/crashnumberingserif.ttf) format('ttf');
}

* {
	-webkit-tap-highlight-color: transparent;
	@apply font-body;
}

.nuxt-icon svg {
	margin: 0 !important;
}
</style>