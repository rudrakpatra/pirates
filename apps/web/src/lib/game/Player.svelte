<script lang="ts" context="module">
	export let pos = new Vector2(0, 0);
</script>

<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import { Group, Raycaster, Vector3 } from 'three';
	import { T, useTask } from '@threlte/core';
	import { CANNON, SHIP } from './Constants';
	import Ship from './Ship.svelte';
	import type { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { OrbitControls } from '@threlte/extras';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import Range from '$lib/components/shared/Range.svelte';
	import { Vector2 } from 'three';

	import { portalAction } from './Utils';
	import Trajectory from './Trajectory.svelte';
	import type { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';

	let cameraRef: PerspectiveCamera;
	const raycaster = new Raycaster();
	let intersection: Vector3;
	const computeIntersection = () => {
		if (!intersection || !cameraRef) return;
		raycaster.setFromCamera(new Vector2(0, 0.5), cameraRef);
		const origin = raycaster.ray.origin;
		const dir = raycaster.ray.direction;
		// origin + K dir , has y=0 solve for K
		//K=-origin.y/dir.y
		//pt=origin+K*dir
		let K = -origin.y / dir.y;
		if (K < 0) K = 10000;
		intersection.set(origin.x + K * dir.x, 0, origin.z + K * dir.z);
		if (intersection.length() > CANNON.RANGE) intersection.normalize().multiplyScalar(CANNON.RANGE);
		intersection = intersection;
	};
	let controlsRef: ThreeOrbitControls;
	$: if (controlsRef?.object) {
		controlsRef.enableDamping = true;
		controlsRef.dampingFactor = 0.2;
		useTask((d) => controlsRef.update(d));
	}

	export let selectedTurnRate = Math.floor(SHIP.TURNRATES.length / 2);
	let uiTurnRate = selectedTurnRate;
	let shipRef: Group;
	let mapRef: HTMLImageElement;
	let cannonRef: HTMLImageElement;
	let x = '0',
		y = '0';
	useTask((d) => {
		if (!shipRef) return;
		shipRef.rotation.y -= SHIP.TURNRATES[selectedTurnRate] * d * DEG2RAD;
		pos = pos
			.clone()
			.add(new Vector2(0, SHIP.SPEED * d).rotateAround({ x: 0, y: 0 }, -shipRef.rotation.y));
		x = pos.x.toFixed(0);
		y = pos.y.toFixed(0);
	});

	const keyDown = (e: KeyboardEvent) => {
		if (e.key === ' ') {
			cannonRef.classList.add('scale-90');
		}
		if (e.key === 'm') {
			mapRef.classList.add('scale-90');
		}
	};
	const keyUp = (e: KeyboardEvent) => {
		if (e.key === ' ') {
			cannonRef.classList.remove('scale-90');
		}
		if (e.key === 'm') {
			mapRef.classList.remove('scale-90');
		}
	};
</script>

<svelte:window on:keydown={keyDown} on:keyup={keyUp} />
<Ship bind:ref={shipRef} />
<T.PerspectiveCamera
	bind:ref={cameraRef}
	makeDefault
	lookAt.y={0.5}
	near={0.1}
	far={1000}
	on:create={({ ref }) => {
		ref.position.set(0, 20, -20);
	}}
>
	<OrbitControls
		bind:ref={controlsRef}
		on:create={({ ref }) => {
			ref.rotateSpeed = 0.4;
		}}
		on:start={() => {
			intersection = new Vector3();
			computeIntersection();
		}}
		on:change={computeIntersection}
		enablePan={false}
		maxDistance={500}
		minDistance={20}
		maxPolarAngle={Math.PI * 0.4}
		minPolarAngle={0}
	/>
</T.PerspectiveCamera>
<Trajectory {intersection} />
<div use:portalAction class="fixed bottom-2 left-2 right-2 flex justify-between gap-2">
	<div class="flex flex-col gap-2">
		<Button tabindex="-1" class="h-fit p-0">
			<img
				bind:this={mapRef}
				draggable="false"
				class="aspect-square h-[min(12vh,12vw)] select-none rounded-md transition-transform active:scale-90"
				src="/map.svg"
				alt="map"
			/>
		</Button>
		<div class="w-[10ch] text-center text-white">{x},{y}</div>
	</div>
	<div class="max-w-xl flex-1 self-end">
		<div class="text-center text-white">Turn Rate</div>
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
			thumbSize="min(8vh,8vw)"
			class="my-[min(4vh,4vw)] h-4 w-full flex-1"
			trackPrimaryClass="rounded-full"
			variant="bicolored"
		>
			<div class="text-center text-xl opacity-75">{SHIP.TURNRATES[uiTurnRate]}</div>
		</Range>
	</div>
	<Button tabindex="-1" class="h-fit -rotate-90 p-0 ">
		<img
			bind:this={cannonRef}
			draggable="false"
			class="aspect-square h-[min(12vh,12vw)] select-none rounded-md transition-transform active:scale-90"
			src="/cannon-ball.svg"
			alt="fire cannon ball"
		/>
	</Button>
</div>
