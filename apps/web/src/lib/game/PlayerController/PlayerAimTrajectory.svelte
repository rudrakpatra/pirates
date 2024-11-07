<script lang="ts">
	import * as T from 'three';
	import { T as Th, useTask } from '@threlte/core';
	import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
	import { CANNON } from '../Constants';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { aimOffset } from '$lib/stores/player';
	import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
	import { Wireframe } from 'three/addons/lines/Wireframe.js';
	import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
	import { tweened } from 'svelte/motion';
	import { sineInOut } from 'svelte/easing';

	export let show = true;
	let lineGeometry = new LineGeometry();
	const matLine = new LineMaterial({
		color: 0xffffff,
		linewidth: 5, // in pixels
		transparent: true,
		opacity: 0,
		dashed: true,
		dashOffset: 0.5,
		dashSize: 1.5,
		gapSize: 0.5
	});
	const maxOpacity = 0.5;
	const tOpacity = tweened(0, { duration: 200, easing: sineInOut });
	$: tOpacity.set(show ? maxOpacity : 0);
	tOpacity.subscribe((v) => (matLine.opacity = v));
	// Wireframe ( WireframeGeometry2, LineMaterial )
	const geometry = new WireframeGeometry2(lineGeometry);
	const wireframe = new Wireframe(geometry, matLine);
	let meshRef: T.Mesh;
	aimOffset.subscribe((offset) => {
		if (!meshRef) return;
		//scale and rotate to intersection
		meshRef.position.copy(offset);
		const projectile = (time: number) => {
			return 10 * time * (1 - time);
		};
		const pt = (t: number) => new T.Vector3().lerp(offset, t).setY(projectile(t));
		const points = 32;
		const array = new Float32Array(points * 3);
		for (let i = 0; i < points; i++) {
			const t = i / (points - 1);
			const p = pt(t);
			array[3 * i] = p.x;
			array[3 * i + 1] = p.y;
			array[3 * i + 2] = p.z;
		}
		lineGeometry.setPositions(array);
		wireframe.geometry = lineGeometry;
		wireframe.computeLineDistances();
	});
</script>

<Th.Mesh
	renderOrder={11}
	on:create={({ ref }) => {
		ref.onBeforeRender = function (renderer) {
			renderer.clearDepth();
		};
	}}
	bind:ref={meshRef}
>
	<Th.CircleGeometry
		args={[CANNON.SIZE, 32]}
		on:create={({ ref }) => {
			ref.rotateX(-90 * DEG2RAD);
		}}
	/>
	<Th.MeshBasicMaterial color={'white'} transparent opacity={$tOpacity} />
</Th.Mesh>
<Th is={wireframe} />
