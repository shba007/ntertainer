import io from 'socket.io-client'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();

	return {
		provide: {
			socket: () => io(config.public.apiURL),
			playerSocket: () => io(`${config.public.apiURL}/player`),
			chatSocket: () => io(`${config.public.apiURL}/chat`),
			callSocket: () => io(`${config.public.apiURL}/call`)
		}
	}
})
