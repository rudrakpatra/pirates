<script lang="ts">
	import { BalancesStore } from '$lib/stores/balance';
	import { Wallet } from '$lib/stores/wallet';
	import Button from './shared/Button.svelte';
	import Card from './shared/Card.svelte';
	import Input from './shared/Input.svelte';

	let loading = false;
</script>

<Card class="w-full p-4">
	<div class="mb-2">
		<h2 class="text-xl font-bold">Faucet</h2>
		<p class="mt-1 text-sm text-zinc-500">Get testing (L2) MINA tokens for your wallet</p>
	</div>
	<form on:submit|preventDefault>
		<div class="pt-3">
			<label for="to" class="block text-sm font-medium text-gray-700">
				To <span class="text-sm text-zinc-500">(your wallet)</span>
			</label>
			<Input id="to" disabled placeholder={$Wallet.address ?? 'Please connect a wallet first'} />
		</div>

		<Button
			size="lg"
			type="submit"
			class="mt-6 w-full"
			{loading}
			on:click={async () => {
				loading = true;
				if (!$Wallet.address) {
					await Wallet.connect();
				} else {
					await BalancesStore.faucet();
				}
				loading = false;
			}}
		>
			{$Wallet.address ? 'Mint Token' : 'Connect wallet'}
		</Button>
	</form>
</Card>
