<script lang="ts">
	import * as T from 'three';
	import { T as Th, useTask, useThrelte } from '@threlte/core';
	import Button from '$lib/components/shared/Button.svelte';
	import Range from '$lib/components/shared/Range.svelte';
	import { portalAction } from '../Utils';
	import {
		aimOffset,
		pointer,
		position,
		quaternion,
		rotationY,
		turnRate,
		velocity
	} from '$lib/stores/player';
	import { SHIP } from '../Constants';
	import PlayerCamera from './PlayerCamera.svelte';
	import PlayerAimTrajectory from './PlayerAimTrajectory.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { get } from 'svelte/store';

	let mapButtonRef: HTMLImageElement;
	let cannonButtonRef: HTMLImageElement;

	let newTurnRate = $turnRate;
	let show = false;
	const { renderer } = useThrelte();
	const canvas = renderer.domElement;
	const pointermove = (e: PointerEvent) => {
		show = true;
		pointer.update((p) => {
			p.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
			p.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;
			return p;
		});
	};
	const pointerenter = (e: PointerEvent) => {
		show = true;
	};
	const pointerleave = (e: PointerEvent) => {
		show = false;
	};
	onMount(() => {
		canvas.addEventListener('pointermove', pointermove);
		canvas.addEventListener('pointerenter', pointerenter);
		canvas.addEventListener('pointerleave', pointerleave);
	});
	onDestroy(() => {
		canvas.removeEventListener('pointermove', pointermove);
		canvas.removeEventListener('pointerenter', pointerenter);
		canvas.removeEventListener('pointerleave', pointerleave);
	});

	useTask((d) => {
		rotationY.set($rotationY - SHIP.TURNRATES[$turnRate] * d * DEG2RAD);
		quaternion.set(new T.Quaternion().setFromEuler(new T.Euler(0, $rotationY, 0)));
		velocity.set(new T.Vector3(0, 0, SHIP.SPEED * d).applyQuaternion(get(quaternion)));
		position.set($position.add($velocity));
	});

	const keyDown = (e: KeyboardEvent) => {
		if (e.key === ' ') {
			cannonButtonRef.classList.add('scale-90');
		}
		if (e.key === 'm') {
			mapButtonRef.classList.add('scale-90');
		}
	};
	const keyUp = (e: KeyboardEvent) => {
		if (e.key === ' ') {
			cannonButtonRef.classList.remove('scale-90');
		}
		if (e.key === 'm') {
			mapButtonRef.classList.remove('scale-90');
		}
	};
</script>

<svelte:window on:keydown={keyDown} on:keyup={keyUp} />
<PlayerCamera />
<PlayerAimTrajectory {show} />
<div use:portalAction class="fixed bottom-2 left-2 right-2 flex justify-between gap-2">
	<div class="fixed top-0 text-white">
		aiming at {$aimOffset.x.toFixed()}, {$aimOffset.y.toFixed()}, {$aimOffset.z.toFixed()}
	</div>
	<div class="flex flex-col gap-2">
		<Button tabindex="-1" class="focus-visible:ring-none h-fit p-0">
			<img
				bind:this={mapButtonRef}
				draggable="false"
				class="aspect-square h-[min(12vh,12vw)] select-none rounded-md transition-transform active:scale-90"
				src="/map.svg"
				alt="map"
			/>
		</Button>
		<div class="w-[10ch] text-center text-white">
			{$position.x.toFixed(0)}, {$position.z.toFixed(0)}
		</div>
	</div>
	<div class="max-w-xl flex-1 self-end">
		<div class="text-center text-white">Turn Rate</div>
		<Range
			step={1}
			min={0}
			max={SHIP.TURNRATES.length - 1}
			defaultValue={Math.floor(SHIP.TURNRATES.length / 2)}
			on:change={(e) => {
				turnRate.set(e.detail.value);
			}}
			on:input={(e) => {
				newTurnRate = e.detail.value;
			}}
			thumbSize="min(8vh,8vw)"
			class="my-[min(4vh,4vw)] h-4 w-full flex-1"
			trackPrimaryClass="rounded-full"
			variant="bicolored"
		>
			<div class="text-center text-xl opacity-75">{SHIP.TURNRATES[newTurnRate]}</div>
		</Range>
	</div>
	<Button tabindex="-1" class="h-fit -rotate-90 p-0">
		<img
			bind:this={cannonButtonRef}
			draggable="false"
			class="aspect-square h-[min(12vh,12vw)] select-none rounded-md transition-transform active:scale-90"
			src="/cannon-ball.svg"
			alt="fire cannon ball"
		/>
	</Button>
</div>
