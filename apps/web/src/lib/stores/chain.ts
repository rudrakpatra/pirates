import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

export type ComputedTransactionJSON = {
	argsFields: string[];
	methodId: string;
	nonce: string;
	sender: string;
	auxiliaryData: string[];
	hash: string;
};

export type Transaction = {
	status: boolean;
	statusMessage?: string;
	tx: ComputedTransactionJSON;
};

export type ComputedBlockJSON = {
	txs?: Transaction[];
};

export type BlockQueryResponse = {
	data: {
		network: {
			staged: {
				block: {
					height: string;
				};
			};
		};
		block: ComputedBlockJSON;
	};
};

const fetchBlock = async (blockHeightToProcess = 0) => {
	const graphql = 'http://localhost:8080/graphql'; // TODO get from env
	// if (graphql === undefined) {
	// 	throw new Error(
	// 		"Environment variable PUBLIC_PROTOKIT_GRAPHQL_URL not set, can't execute graphql requests"
	// 	);
	// }
	try {
		const response = await fetch(graphql, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: `
						query GetBlock {
							block(height: ${blockHeightToProcess}) {
								txs {
									tx {
										argsFields
										methodId
										nonce
										sender
										auxiliaryData
										hash
									}
									status
									statusMessage
								}
							}
							network {
								staged {
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
		return data;
	} catch (error) {
		console.error('Failed to load block:', error);
	}
};

const createChainStore = () => {
	const { subscribe, update } = writable({
		latestBlockHeight: undefined as number | undefined,
		blockHeightToProcess: 0 as Readonly<number>
	});
	// let blockHeightToProcess = 0;

	const listeners = [] as {
		filter: (tx: Transaction) => boolean;
		handler: ((tx: Transaction) => Promise<void>) | ((tx: Transaction) => void);
	}[];

	async function polling(pollingInterval = 5000, maxLookBack = 10) {
		while (browser) {
			let blockHeightToProcess = get(Chain).blockHeightToProcess;
			const data = await fetchBlock(blockHeightToProcess);
			if (data?.block) {
				const latestBlockHeight = Number(data?.network.staged.block.height) || 0;
				update((s) => ({ ...s, latestBlockHeight }));

				if (latestBlockHeight >= blockHeightToProcess && data.block.txs) {
					for (const tx of data.block.txs) {
						await processTx(tx);
					}
					blockHeightToProcess++;
				}

				if (latestBlockHeight < blockHeightToProcess) {
					await new Promise((resolve) => setTimeout(resolve, pollingInterval));
				} else {
					// poll faster
					await new Promise((resolve) => setTimeout(resolve, 0));
				}
				blockHeightToProcess = Math.max(blockHeightToProcess, latestBlockHeight - maxLookBack);
				update((s) => ({ ...s, blockHeightToProcess }));
			} else {
				await new Promise((resolve) => setTimeout(resolve, pollingInterval / 2));
			}
		}
	}
	async function processTx(tx: Transaction) {
		for (const listener of listeners) {
			if (listener.filter(tx)) {
				await listener.handler(tx);
			}
		}
	}

	return {
		subscribe,
		startPolling: () => {
			polling();
		},
		on: (
			filter: (tx: Transaction) => boolean,
			handler: ((tx: Transaction) => Promise<void>) | ((tx: Transaction) => void)
		) => {
			listeners.push({ filter, handler });
		}
	};
};

export const Chain = createChainStore();
