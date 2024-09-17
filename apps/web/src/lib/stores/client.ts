import { writable } from 'svelte/store';
import { client } from 'chain';

export type Client = typeof client;

const createClientStore = () => {
	const { subscribe, update } = writable({
		loading: true,
		client: undefined as Client | undefined
	});

	client.start().then(() => {
		update(() => ({
			loading: false,
			client: client
		}));
	});

	return {
		subscribe
	};
};

export const ClientStore = createClientStore();
