import { MediaPlayer, PlaybackTimeUpdatedEvent, QualityChangeRequestedEvent } from 'dashjs';

export default defineNuxtPlugin(() => {
	return {
		provide: {
			player: MediaPlayer().create()
		}
	}
})

export { PlaybackTimeUpdatedEvent, QualityChangeRequestedEvent }