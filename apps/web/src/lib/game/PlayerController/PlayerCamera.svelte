<script lang="ts">
	import * as T from 'three';
	import { T as Th, useTask } from '@threlte/core';
	import { CANNON } from '../Constants';
	import type { OrbitControls as ThreeOrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { OrbitControls } from '@threlte/extras';
	import { aimOffset, pointer } from '$lib/stores/player';

	let cameraRef: T.PerspectiveCamera;

	const raycaster = new T.Raycaster();

	const updateAimedPosition = () => {
		aimOffset.update((o) => {
			if (!cameraRef) return o;
			raycaster.setFromCamera($pointer, cameraRef);
			const origin = raycaster.ray.origin;
			const dir = raycaster.ray.direction;
			//origin + K * dir , has y=0 solve for K
			//K=-origin.y/dir.y
			//pt=origin+K*dir
			let K = -origin.y / dir.y;
			if (K < 0) K = 10000;
			const pt = new T.Vector3(origin.x + K * dir.x, 0, origin.z + K * dir.z);
			if (pt.length() > CANNON.RANGE) pt.normalize().multiplyScalar(CANNON.RANGE);
			return pt;
		});
	};
	pointer.subscribe(updateAimedPosition);
	let controlsRef: ThreeOrbitControls;
	$: if (controlsRef?.object) {
		controlsRef.enableDamping = true;
		controlsRef.dampingFactor = 0.2;
		useTask((d) => controlsRef.update(d));
	}
</script>

<Th.PerspectiveCamera
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
			updateAimedPosition();
		}}
		on:change={() => {
			updateAimedPosition();
		}}
		enablePan={false}
		maxDistance={800}
		minDistance={20}
		maxPolarAngle={Math.PI * 0.45}
		minPolarAngle={Math.PI * 0.05}
	/>
</Th.PerspectiveCamera>
