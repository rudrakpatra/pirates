<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import { Group } from 'three';
	import { useThrelte, useTask } from '@threlte/core';
	import { SHIP } from './Constants';
	import Ship from './Ship.svelte';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import Range from '$lib/components/shared/Range.svelte';
	export let selectedTurnRate = Math.floor(SHIP.TURNRATES.length / 2);
	let uiTurnRate = selectedTurnRate;
	let shipRef: Group;
	useTask((d) => {
		shipRef.rotation.y -= SHIP.TURNRATES[selectedTurnRate] * d * DEG2RAD;
		shipRef;
	});
	const { renderer } = useThrelte();
	const portalAction = (el: HTMLElement) => {
		const target = renderer.domElement.parentElement;
		if (!target) {
			console.warn('HTML: target is undefined.');
			return;
		}
		target.appendChild(el);
		return {
			destroy: () => {
				if (!el.parentNode) return;
				el.parentNode.removeChild(el);
			}
		};
	};
</script>

<Ship bind:ref={shipRef} />
<div use:portalAction class="fixed bottom-2 left-2 right-2 flex justify-between gap-2">
	<Button class="h-fit p-0">
		<img
			draggable="false"
			class="aspect-square h-[min(16vh,16vw)] select-none rounded-md"
			src="/map.svg"
			alt="map"
		/>
	</Button>
	<div class="max-w-xl flex-1 self-end">
		<div class="text-center">Turn Rate</div>
		<Range
			step={1}
			min={0}
			max={SHIP.TURNRATES.length - 1}
			defaultValue={Math.floor(SHIP.TURNRATES.length / 2)}
			on:change={(e) => {
				selectedTurnRate = e.detail.value;
			}}
			on:input={(e) => {
				uiTurnRate = e.detail.value;
			}}
			class="my-[min(4vh,4vw)] h-8 w-full flex-1"
			trackPrimaryClass="rounded-full"
			knobClass="h-[min(8vh,8vw)]"
			variant="bicolored"
		>
			<div class="text-center text-xl opacity-75">{SHIP.TURNRATES[uiTurnRate]}</div>
		</Range>
	</div>
	<Button class="h-fit p-0">
		<img
			draggable="false"
			class="aspect-square h-[min(16vh,16vw)] -rotate-90 select-none rounded-md"
			src="/cannon-ball.svg"
			alt="fire cannon ball"
		/>
	</Button>
</div>
