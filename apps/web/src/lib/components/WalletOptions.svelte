<script lang="ts">
	import { Wallet } from '$lib/stores/wallet';
	import { truncateMiddle } from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
	import Button from './shared/Button.svelte';
	import Card from './shared/Card.svelte';
	let dispatch = createEventDispatcher();
	const handlePopup = (node: HTMLDivElement) => {
		const handlePointerDown = (e: PointerEvent) => {
			if (node && !node.contains(e.target as Node) && !e.defaultPrevented) dispatch('close');
		};
		document.addEventListener('pointerdown', handlePointerDown, true);

		return {
			destroy() {
				document.removeEventListener('pointerdown', handlePointerDown, true);
			}
		};
	};
</script>

<div use:handlePopup>
	<Card class="w-full bg-white p-4">
		<div class="mb-2">
			<h2 class="text-xl font-bold">{truncateMiddle($Wallet.address || '...', 7, 7)}</h2>
			<p class="mt-1 text-sm text-zinc-500">Your wallet address</p>
		</div>
		<form on:submit|preventDefault>
			<Button on:click={() => {}} size="lg" type="submit" class="mt-6 w-full">Disconnect</Button>
		</form>
	</Card>
</div>
