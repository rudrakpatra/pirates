import { writable } from 'svelte/store';
import { client } from 'chain';

export type Client = typeof client;

function createClientStore() {
	const { subscribe, set, update } = writable({
		loading: false,
		client: undefined as Client | undefined
	});

	return {
		subscribe,
		start: async () => {
			update((state) => ({ ...state, loading: true }));

			await client.start();

			update((state) => ({
				loading: false,
				client: client as Client
			}));
		}
	};
}

export const clientStore = createClientStore();
