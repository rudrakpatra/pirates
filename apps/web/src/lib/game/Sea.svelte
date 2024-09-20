<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { BufferGeometry, Float32BufferAttribute, DoubleSide } from 'three';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { generateRandomPointsInGrid, sea } from './Utils';
	import { pos } from './Player.svelte';
	const sz = 2;
	const amt = 2;
	const cx = 50,
		cy = 50;
	sea.amp = 2;
	sea.scale = 1 / 50;
	const points0 = generateRandomPointsInGrid(cx, cy, sz, amt);
	let points = points0.slice();
	let b = new BufferGeometry();
	useTask((d) => {
		sea.update(d);
		// update foam
		for (let i = 0; i < points.length; i += 3) {
			points[i] = ((points0[i] + pos.x) % (cx * sz)) - (cx * sz) / 2;
			points[i + 2] = ((points0[i + 2] + pos.y) % (cy * sz)) - (cy * sz) / 2;
			points[i + 1] = sea.heightAt(points[i], points[i + 2]);
		}
		b.setAttribute('position', new Float32BufferAttribute(points, 3));
		b.computeVertexNormals();
	});
</script>

<T.AxesHelper
	args={[10]}
	renderOrder={200}
	on:create={({ ref }) => {
		ref.onBeforeRender = function (renderer) {
			renderer.clearDepth();
		};
	}}
/>
<T.Mesh rotation.x={-90 * DEG2RAD}>
	<T.PlaneGeometry args={[1e3, 1e3]} />
	<T.MeshStandardMaterial color="#28a2ff" />
</T.Mesh>
<T.Points>
	<T is={b} />
	<T.PointsMaterial size={1} />
</T.Points>
