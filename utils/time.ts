function formatTime(duration: number, separator = true) {
	duration = Math.max(duration, 0);

	const h = Math.floor(duration / 3600);
	const m = Math.floor(duration % 3600 / 60);
	const s = Math.floor(duration % 3600 % 60);

	let prefix = ""
	const hour = h > 0 ? h : ""

	prefix = h > 0 ? (separator ? ":" : "h ") + (m < 10 ? "0" : "") : ""
	const minute = prefix + m + (separator ? ":" : "m ")

	prefix = s < 10 ? "0" : ""
	const second = prefix + s

	return `${hour}${minute}${separator ? second : ''}`
}

export { formatTime }