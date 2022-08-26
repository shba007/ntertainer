export interface Media {
	videography: "Live-Action" | "Animation",
	type: "erotica" | "movie" | "tv-series" | "web-series",
	id: string,
	title: string,
	langs: { subtitle: string[], audio: string[] },
	genres: string[],
	description: string,
	cast: string[],
	directors: string[],
	release: { date: string, status: "released" | "upcoming" }
	episodes: string,
	production: string,
	duration: number,
	rating: number[],
	views: number
}

export interface Seek {
	time: number;
	timestamp: number
}

export interface Room {
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
		seek: Seek;
	}
}

export interface Participant {
	id: string;
	local: boolean,
	name: { first: string; last: string };
	audio: boolean;
	video: boolean;
	stream: MediaStream;
}