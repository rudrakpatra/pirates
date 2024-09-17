import { get, writable } from 'svelte/store';
import { ClientStore } from './client';
import { PublicKey } from 'o1js';
import { Chain } from './chain';
import { browser } from '$app/environment';
import type { ProviderError } from '@aurowallet/mina-provider';
import { MethodIdResolver } from '@proto-kit/module';

function createWalletStore() {
	const { subscribe, update } = writable({
		loading: false,
		address: undefined as string | undefined,
		networkID: undefined as string | undefined,
		error: undefined as ProviderError | undefined | 'No wallet installed'
	});

	if (browser) {
		if (typeof window.mina === 'undefined') {
			update((state) => ({ ...state, error: 'No wallet installed' }));
		} else {
			window.mina.getAccounts().then(([address]) => {
				update((state) => ({ ...state, address }));
			});
			window.mina.requestNetwork().then((network) => {
				update((state) => ({ ...state, networkID: network.networkID }));
			});
			window.mina.on('accountsChanged', ([address]) => {
				update((state) => ({ ...state, address }));
			});
		}
	}

	return {
		subscribe,
		connectWallet: async () => {
			if (typeof window.mina === 'undefined') {
				throw new Error('Auro wallet not installed');
			}
			update((state) => ({ ...state, loading: true }));
			const response = await window.mina.requestAccounts();
			if (Array.isArray(response)) {
				update((state) => ({ ...state, address: response[0], loading: false }));
			} else {
				update((state) => ({ ...state, error: response, loading: false }));
			}
		},
		sendTransaction: async (transaction: () => Promise<void>) => {
			const sender = get(Wallet).address;
			const client = get(ClientStore).client;
			if (!sender || !client) {
				console.error('Failed to send transaction: ', sender, client);
				return;
			}
			const tx = await client.transaction(PublicKey.fromBase58(sender), transaction);
			await tx.sign();
			await tx.send();
			const hash = tx.transaction?.hash().toString() || '';
			return new Promise((resolve, reject) => {
				Chain.on(
					(transaction) => transaction.tx.hash === hash,
					(transaction) => {
						if (transaction.status) {
							resolve({});
						} else {
							const client = get(ClientStore).client;
							if (client === undefined) {
								reject(transaction.statusMessage);
								return;
							}
							const methodIdResolver = client.resolveOrFail('MethodIdResolver', MethodIdResolver);
							const resolvedMethodDetails = methodIdResolver.getMethodNameFromId(
								BigInt(transaction.tx.methodId)
							);

							const [moduleName, methodName] = resolvedMethodDetails ?? ['NotFound', ''];
							reject(`${moduleName}.${methodName}: ` + transaction.statusMessage);
						}
						// TODO set timeout for rejection
					}
				);
			});
		}
	};
}

export const Wallet = createWalletStore();
