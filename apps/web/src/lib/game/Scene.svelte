<script lang="ts">
	import { T, useFrame, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import Player from './Player.svelte';
	import Sea from './Sea.svelte';
	import { CANNON, SHIP, SUN, WORLD } from './Constants';
	import { FogExp2 } from 'three';
	import Trajectory from './Trajectory.svelte';
	import type { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
	import { Raycaster } from 'three/src/core/Raycaster.js';
	import { Vector2 } from 'three/src/math/Vector2.js';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import type { Mesh } from 'three/src/objects/Mesh.js';
	import type { Intersection } from 'three';
	const { scene } = useThrelte();
	scene.background = WORLD.COLOR;
	scene.fog = new FogExp2(WORLD.COLOR, 0.004);
	let planeRef: Mesh;
	let cameraRef: PerspectiveCamera;
	const raycaster = new Raycaster();
	let intersection: Intersection;
	let mouse = new Vector2();
	const { renderer } = useThrelte();
	renderer.domElement.addEventListener('pointermove', (e) => {
		mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
		mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;
		computeIntersection();
	});
	const computeIntersection = () => {
		if (!cameraRef) return;
		raycaster.setFromCamera(mouse, cameraRef);
		if (!planeRef) return;
		intersection = raycaster.intersectObject(planeRef)[0];
	};
	useFrame(computeIntersection);
</script>

<Player />
<Sea />
<Trajectory {intersection} />
<T.DirectionalLight
	position.y={10}
	position.z={5}
	castShadow
	shadow.camera.left={-2.5}
	shadow.camera.right={2.5}
	shadow.camera.top={2.5}
	shadow.camera.bottom={-2.5}
	shadow.mapSize.width={1024}
	shadow.mapSize.height={1024}
	color={SUN.COLOR}
/>

<T.AmbientLight intensity={0.5} />
<T.Mesh
	bind:ref={planeRef}
	rotation.x={-90 * DEG2RAD}
	renderOrder={100}
	on:create={({ ref }) => {
		ref.onBeforeRender = (renderer) => {
			renderer.clearDepth();
		};
	}}
>
	<T.PlaneGeometry args={[WORLD.SIZE, WORLD.SIZE]} />
	<T.MeshStandardMaterial color="#ffffff" wireframe transparent opacity={0.2} />
</T.Mesh>
<T.PerspectiveCamera makeDefault bind:ref={cameraRef} position={[0, 20, -20]} near={0.1} far={1000}>
	<OrbitControls
		enablePan={false}
		maxDistance={50}
		minDistance={20}
		maxPolarAngle={Math.PI * 0.45}
		minPolarAngle={0}
	/>
</T.PerspectiveCamera>
