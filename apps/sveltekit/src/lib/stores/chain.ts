import { writable } from 'svelte/store';

export interface ComputedTransactionJSON {
	argsFields: string[];
	argsJSON: string[];
	methodId: string;
	nonce: string;
	sender: string;
	signature: {
		r: string;
		s: string;
	};
}

export interface ComputedBlockJSON {
	txs?: {
		status: boolean;
		statusMessage?: string;
		tx: ComputedTransactionJSON;
	}[];
}

export interface BlockQueryResponse {
	data: {
		network: {
			unproven?: {
				block: {
					height: string;
				};
			};
		};
		block: ComputedBlockJSON;
	};
}

function createChainStore() {
	const { subscribe, set, update } = writable({
		loading: false,
		block: undefined as ({ height: string } & ComputedBlockJSON) | undefined
	});

	let intervalId: ReturnType<typeof setInterval>;

	return {
		subscribe,
		loadBlock: async () => {
			update((state) => ({ ...state, loading: true }));

			const graphql = 'http://localhost:8080/graphql';
			if (graphql === undefined) {
				throw new Error(
					"Environment variable PUBLIC_PROTOKIT_GRAPHQL_URL not set, can't execute graphql requests"
				);
			}

			try {
				const response = await fetch(graphql, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						query: `
							query GetBlock {
								block {
									txs {
										tx {
											argsFields
											auxiliaryData
											methodId
											nonce
											sender
											signature {
												r
												s
											}
										}
										status
										statusMessage
									}
								}
								network {
									unproven {
										block {
											height
										}
									}
								}
							}
						`
					})
				});

				const { data } = (await response.json()) as BlockQueryResponse;
				console.log('data', { data });
				update((state) => ({
					loading: false,
					block: data.network.unproven
						? {
								height: data.network.unproven.block.height,
								...data.block
						  }
						: undefined
				}));
			} catch (error) {
				console.error('Failed to load block:', error);
				update((state) => ({ ...state, loading: false }));
			}
		},
		startPolling: (interval: number = 5000) => {
			chainStore.loadBlock();
			intervalId = setInterval(chainStore.loadBlock, interval);
		},
		stopPolling: () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		}
	};
}

export const chainStore = createChainStore();
