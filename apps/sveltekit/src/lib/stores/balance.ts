import { writable, derived, get } from 'svelte/store';
import type { Client } from './client';
import { PendingTransaction } from '@proto-kit/sequencer';
import { Balance, BalancesKey, TokenId } from '@proto-kit/library';
import { PublicKey } from 'o1js';
import { walletStore } from './wallet';
import { clientStore } from './client';

export const tokenId = TokenId.from(0);

function createBalancesStore() {
	const { subscribe, set, update } = writable({
		loading: false,
		balances: {} as Record<string, string>
	});

	return {
		subscribe,
		loadBalance: async (client: Client, address: string) => {
			update((state) => ({ ...state, loading: true }));

			const key = BalancesKey.from(tokenId, PublicKey.fromBase58(address));
			const balance = await client.query.runtime.Balances.balances.get(key);

			update((state) => ({
				loading: false,
				balances: { ...state.balances, [address]: balance?.toString() ?? '0' }
			}));
		},
		faucet: async (client: Client, address: string): Promise<PendingTransaction> => {
			const balances = client.runtime.resolve('Balances');
			const sender = PublicKey.fromBase58(address);

			const tx = await client.transaction(sender, async () => {
				await balances.addBalance(tokenId, sender, Balance.from(1000));
			});

			await tx.sign();
			await tx.send();

			if (!(tx.transaction instanceof PendingTransaction)) {
				throw new Error('Transaction is not a PendingTransaction');
			}

			return tx.transaction;
		},
		updateBalance: async () => {
			const client = get(clientStore).client;
			const wallet = get(walletStore).wallet;
			if (client && wallet) {
				await balancesStore.loadBalance(client, wallet);
			}
		}
	};
}

export const balancesStore = createBalancesStore();
