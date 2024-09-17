<script lang="ts">
	import { BalancesStore } from '$lib/stores/balance';
	import { Chain } from '$lib/stores/chain';
	import { Wallet } from '$lib/stores/wallet';
	import { ClientStore } from '$lib/stores/client';

	import { truncateMiddle } from '$lib/utils';
	import Button from './shared/Button.svelte';
	import Separator from './shared/Separator.svelte';
	import Skeleton from './shared/Skeleton.svelte';

	$: balance = $Wallet.address ? $BalancesStore.balances[$Wallet.address] : undefined;
	$: $ClientStore && $Wallet.address && BalancesStore.updateBalance(); // have to wait till client is ready
</script>

<div class="flex items-center justify-between border-b p-2 shadow-sm">
	<div class="container flex">
		<div class="flex basis-6/12 items-center justify-start">
			<img class="h-8 w-8" src="/protokit-zinc.svg" alt="Protokit logo" />
			<Separator class="mx-4 h-8" orientation="vertical" />
			<div class="flex grow">
				<div class="flex items-center">
					<div
						class="mr-1 h-2 w-2 rounded-full {$Chain.latestBlockHeight
							? 'bg-green-400'
							: 'bg-orange-400'} "
					/>
					<div class="text-xs text-slate-600">{$Chain.latestBlockHeight ?? '-'}</div>
				</div>
			</div>
		</div>
		<div class="flex basis-6/12 flex-row items-center justify-end">
			<div class="mr-4 flex shrink flex-col items-end justify-center">
				<div>
					<p class="text-xs">Your balance</p>
				</div>
				<div class="w-32 pt-0.5 text-right">
					{#if $BalancesStore.loading}
						<Skeleton class="h-4 w-full bg-gray-300 " />
					{:else}
						<p class="text-xs font-bold">{balance ?? '-'} MINA</p>
					{/if}
				</div>
			</div>

			<Button loading={$Wallet.loading} class="w-44" on:click={Wallet.connectWallet}>
				<div>
					{$Wallet.address ? truncateMiddle($Wallet.address, 7, 7) : 'Connect wallet'}
				</div>
			</Button>
		</div>
	</div>
</div>
