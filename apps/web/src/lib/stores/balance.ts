import { writable, get } from 'svelte/store';
import { Balance, BalancesKey, TokenId } from '@proto-kit/library';
import { PublicKey } from 'o1js';
import { Wallet } from './wallet';
import { ClientStore } from './client';
import toast from 'svelte-french-toast';

export const tokenId = TokenId.from(0);

function createBalancesStore() {
	const { subscribe, update } = writable({
		loading: true,
		balances: {} as Record<string, string>
	});

	return {
		subscribe,
		faucet: async (): Promise<unknown> => {
			const client = get(ClientStore).client;
			const address = get(Wallet).address;
			if (!client || !address) {
				throw new Error('No client or address');
			}
			const balances = client.runtime.resolve('Balances');
			const sender = PublicKey.fromBase58(address);

			update((state) => ({ ...state, loading: true }));

			return Wallet.sendTransaction(async () => {
				await balances.addBalance(tokenId, sender, Balance.from(1000));
			})
				.then(async () => {
					// const key = BalancesKey.from(tokenId, PublicKey.fromBase58(address));
					const balance = get(BalancesStore).balances[address];
					update((state) => ({
						...state,
						balances: { ...state.balances, [address]: (BigInt(balance || 0) + 1000n).toString() }
					}));
					toast.success('Success !!!', { duration: 5000 });
				})
				.catch((e) => {
					console.error(e);
					toast.error('Failed: ' + e);
				})
				.finally(() => {
					update((state) => ({
						...state,
						loading: false
					}));
				});
		},
		updateBalance: async () => {
			const client = get(ClientStore).client;
			const address = get(Wallet).address;
			if (client && address) {
				update((state) => ({ ...state, loading: true }));
				const key = BalancesKey.from(tokenId, PublicKey.fromBase58(address));
				const balance = await client.query.runtime.Balances.balances.get(key);
				update((state) => ({
					loading: false,
					balances: { ...state.balances, [address]: balance?.toString() ?? '0' }
				}));
			}
		}
	};
}

export const BalancesStore = createBalancesStore();
