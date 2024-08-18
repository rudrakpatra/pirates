<script lang="ts">
	import { onMount } from 'svelte';
	import Faucet from '$lib/components/Faucet.svelte';
	import type { PendingTransaction } from '@proto-kit/sequencer';
	import { walletStore } from '$lib/stores/wallet';
	import { balancesStore } from '$lib/stores/balance';
	import { chainStore } from '$lib/stores/chain';
	import { clientStore } from '$lib/stores/client';

	let loading = false;

	onMount(async () => {
		await clientStore.start();
		await walletStore.initializeWallet();
		walletStore.observeWalletChange();
		chainStore.startPolling();
	});

	$: {
		if ($walletStore.wallet) {
			balancesStore.updateBalance();
		}
	}

	async function handleDrip() {
		loading = true;
		try {
			await walletStore.drip();
		} catch (error) {
			console.error('Failed to drip tokens:', error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto -mt-32 h-full pt-16">
	<div class="flex h-full w-full items-center justify-center pt-16">
		<div class="flex basis-4/12 flex-col items-center justify-center 2xl:basis-3/12">
			<Faucet
				wallet={$walletStore.wallet}
				onConnectWallet={walletStore.connectWallet}
				onDrip={handleDrip}
				{loading}
			/>
		</div>
	</div>
</div>
