<script lang="ts">
	import Button from './ui/Button.svelte';
	import Card from './ui/Card.svelte';
	import Input from './ui/Input.svelte';

	export let wallet: string | undefined;
	export let loading: boolean;
	export let onConnectWallet: () => void;
	export let onDrip: () => void;
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
			<Input id="to" disabled placeholder={wallet ?? 'Please connect a wallet first'} />
		</div>

		<Button
			size="lg"
			type="submit"
			class="mt-6 w-full"
			{loading}
			on:click={() => {
				if (!wallet) {
					onConnectWallet();
				} else {
					onDrip();
				}
			}}
		>
			{wallet ? 'Drip 💦' : 'Connect wallet'}
		</Button>
	</form>
</Card>
