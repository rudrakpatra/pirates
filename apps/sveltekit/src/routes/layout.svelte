<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { walletStore } from '$lib/stores/wallet';
	import { balancesStore } from '$lib/stores/balance';
	import { chainStore } from '$lib/stores/chain';
	import { clientStore } from '$lib/stores/client';
	// import 'reflect-metadata';
</script>

<Header
	loading={$clientStore.loading}
	wallet={$walletStore.wallet}
	onConnectWallet={walletStore.connectWallet}
	balance={$balancesStore.balances[$walletStore.wallet ?? '']}
	balanceLoading={$balancesStore.loading}
	blockHeight={$chainStore.block?.height ?? '-'}
/>

<slot />
