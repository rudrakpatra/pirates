<script lang="ts">
	import { T } from '@threlte/core';
	import { portalAction } from './Utils';
	import { Mesh, Vector3, CubicBezierCurve3 } from 'three';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { CANNON } from './Constants';
	import { Line2 } from 'three/addons/lines/Line2.js';
	import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
	import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
	let curve = new CubicBezierCurve3();
	let lineGeometry = new LineGeometry();
	let lineMaterial = new LineMaterial({
		color: 0xffffff,
		linewidth: 0.5, // in world units with size attenuation, pixels otherwise
		vertexColors: false,
		transparent: true,
		opacity: 0.5,
		worldUnits: true,

		dashed: false,
		alphaToCoverage: false
	});
	let line2Ref = new Line2(lineGeometry, lineMaterial);
	let meshRef: Mesh;
	export let intersection: Vector3;
	$: if (intersection && meshRef) {
		//scale and rotate to intersection
		meshRef.position.copy(intersection);

		const i = intersection;
		curve.v0.set(0, 1, 0);
		curve.v1.set(i.x / 10, i.length() / 10, i.z / 10);
		curve.v2.set(i.x - i.x / 10, i.length() / 10, i.z - i.z / 10);
		curve.v3.set(i.x, 1 + i.y, i.z);
		lineGeometry.setPositions(curve.getPoints(50).flatMap((v) => [v.x, v.y, v.z]));
	}
</script>

<div use:portalAction class="absolute top-0 text-white">
	{intersection?.x.toFixed()}, {intersection?.y.toFixed()}, {intersection?.z.toFixed()}
</div>
{#if intersection}
	<T.Mesh
		bind:ref={meshRef}
		renderOrder={-0}
		on:create={({ ref }) => {
			ref.onBeforeRender = (renderer) => {
				renderer.clearDepth();
			};
		}}
	>
		<T.CircleGeometry
			args={[CANNON.SIZE, 32]}
			on:create={({ ref }) => {
				ref.rotateX(-90 * DEG2RAD);
			}}
		/>
		<T.MeshBasicMaterial color={'white'} transparent opacity={0.5} />
	</T.Mesh>
	<T is={line2Ref} />
{/if}
