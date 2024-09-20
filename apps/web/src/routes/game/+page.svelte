<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import Game from '$lib/game/Game.svelte';
	import { Wallet } from '$lib/stores/wallet';
</script>

<svelte:head>
	<title>Game</title>
</svelte:head>
<div>
	{#if $Wallet.address}
		<Game />
	{:else}
		<div class="flex h-full w-full items-center justify-center pt-16">
			<div class="m-6 flex basis-4/12 flex-col items-center justify-center 2xl:basis-3/12">
				<div class="mb-2">
					<h2 class="text-xl font-bold">Wallet Required</h2>
					<p class="mt-1 text-sm text-zinc-500">You must connect to play this game</p>
				</div>
				<Button on:click={() => Wallet.connect()} size="lg" class="mt-6">Connect Wallet</Button>
			</div>
		</div>
	{/if}
</div>

<style>
</style>
