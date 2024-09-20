<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';
	import { Chain } from '$lib/stores/chain';
	import { Wallet } from '$lib/stores/wallet';
	import { filterTxn } from '$lib/utils';
	import { PerfMonitor } from '@threlte/extras';

	// setup Chain.on
	Chain.on(
		(tx) => filterTxn.byMethodName(tx, 'Logic', 'spawn'),
		() => {
			//read and spawn sender
		}
	);
	Chain.on(
		(tx) => filterTxn.byMethodName(tx, 'Logic', 'leave'),
		() => {
			//remove the sender
		}
	);
	Chain.on(
		(tx) => filterTxn.byMethodName(tx, 'Logic', 'changeTurnRate'),
		() => {
			//change the turn rate of the sender
		}
	);
	Chain.on(
		(tx) => filterTxn.byMethodName(tx, 'Logic', 'shoot'),
		() => {
			//show the target mark
		}
	);
	Chain.on(
		(tx) => filterTxn.byMethodName(tx, 'Logic', 'hit'),
		() => {
			//show the target mark
		}
	);
	Chain.on(
		(tx) => filterTxn.byMethodName(tx, 'Logic', 'pickupLoot'),
		() => {
			//remove the loot
		}
	);

	let w = innerWidth;
	let h = innerHeight;
</script>

<svelte:window bind:innerWidth={w} bind:innerHeight={h} />
<div class="fixed inset-0">
	<Canvas renderMode="always" size={{ width: w, height: h }}>
		<PerfMonitor anchorX={'right'} logsPerSecond={30} />
		<Scene />
	</Canvas>
</div>
