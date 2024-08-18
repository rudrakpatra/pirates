<script lang="ts">
	import Chain from './Chain.svelte';
	import Button from './ui/Button.svelte';
	import Separator from './ui/Separator.svelte';
	import Skeleton from './ui/Skeleton.svelte';

	export let loading: boolean;
	export let wallet: string | undefined;
	export let onConnectWallet: () => void;
	export let balance: string | undefined;
	export let balanceLoading: boolean;
	export let blockHeight: string;

	function truncateMiddle(
		str: string,
		startChars: number,
		endChars: number,
		ellipsis = '...'
	): string {
		if (str.length <= startChars + endChars) {
			return str;
		}
		return str.slice(0, startChars) + ellipsis + str.slice(-endChars);
	}
</script>

<div class="flex items-center justify-between border-b p-2 shadow-sm">
	<div class="container flex">
		<div class="flex basis-6/12 items-center justify-start">
			<img class="h-8 w-8" src="/protokit-zinc.svg" alt="Protokit logo" />
			<Separator class="mx-4 h-8" orientation="vertical" />
			<div class="flex grow">
				<Chain height={blockHeight} />
			</div>
		</div>
		<div class="flex basis-6/12 flex-row items-center justify-end">
			{#if wallet}
				<div class="mr-4 flex shrink flex-col items-end justify-center">
					<div>
						<p class="text-xs">Your balance</p>
					</div>
					<div class="w-32 pt-0.5 text-right">
						{#if balanceLoading && balance === undefined}
							<Skeleton class="h-4 w-full" />
						{:else}
							<p class="text-xs font-bold">{balance} MINA</p>
						{/if}
					</div>
				</div>
			{/if}
			<Button {loading} class="w-44" on:click={onConnectWallet}>
				<div>
					{wallet ? truncateMiddle(wallet, 7, 7) : 'Connect wallet'}
				</div>
			</Button>
		</div>
	</div>
</div>
