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

function calculateRating(ratings: number[]) {
	const totalRating = ratings.reduce((total, count, rating) => total + (rating + 1) * count, 0)
	const totalRatingScale = 1 + 2 + 3 + 4 + 5

	return (totalRating / totalRatingScale).toFixed(1)
}

function trim(str: string, length: number) {
	return str.length > length ? str.slice(0, length) + '...' : str
}

function getLangCode(lang: string): string {
	return { 'Bengali': 'bn', 'Hindi': 'hi', 'English': 'en' }[lang]
}

function getCodeLang(code: string): string {
	const languageNames = new Intl.DisplayNames(['en'], {
		type: 'language'
	});
	return languageNames.of(code)
}

export { formatTime, calculateRating, trim, getLangCode, getCodeLang }