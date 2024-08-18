import { get, writable } from 'svelte/store';
import type { PendingTransaction } from '../../../node_modules/@proto-kit/sequencer';
import { balancesStore } from './balance';
import { clientStore } from './client';

function createWalletStore() {
	const { subscribe, set, update } = writable({
		wallet: undefined as string | undefined,
		pendingTransactions: [] as PendingTransaction[]
	});

	return {
		subscribe,
		initializeWallet: async () => {
			if (typeof window.mina === 'undefined') {
				throw new Error('Auro wallet not installed');
			}

			try {
				const [wallet] = await window.mina.getAccounts();
				update((state) => ({ ...state, wallet }));
			} catch (error) {
				console.error('Failed to initialize wallet:', error);
			}
		},
		connectWallet: async () => {
			if (typeof window.mina === 'undefined') {
				throw new Error('Auro wallet not installed');
			}

			try {
				const [wallet] = await window.mina.requestAccounts();
				update((state) => ({ ...state, wallet }));
			} catch (error) {
				console.error('Failed to connect wallet:', error);
			}
		},
		observeWalletChange: () => {
			if (typeof window.mina === 'undefined') {
				throw new Error('Auro wallet not installed');
			}

			window.mina.on('accountsChanged', ([wallet]) => {
				update((state) => ({ ...state, wallet }));
			});
		},
		addPendingTransaction: (pendingTransaction: PendingTransaction) => {
			update((state) => ({
				...state,
				pendingTransactions: [...state.pendingTransactions, pendingTransaction]
			}));
		},
		removePendingTransaction: (pendingTransaction: PendingTransaction) => {
			update((state) => ({
				...state,
				pendingTransactions: state.pendingTransactions.filter(
					(tx) => tx.hash().toString() !== pendingTransaction.hash().toString()
				)
			}));
		},
		drip: async () => {
			const { wallet } = get(walletStore);
			const client = get(clientStore).client;
			if (!wallet || !client) {
				throw new Error('Wallet not connected or client not initialized');
			}
			try {
				const pendingTransaction = await balancesStore.faucet(client, wallet);
				walletStore.addPendingTransaction(pendingTransaction);
			} catch (error) {
				console.error('Failed to drip tokens:', error);
			}
		}
	};
}

export const walletStore = createWalletStore();
