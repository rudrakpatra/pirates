<script lang="ts">
	import { T } from '@threlte/core';
	import type { Intersection } from 'three';
	import { portalAction } from './Utils';
	import { Vector3, type BufferGeometry } from 'three/webgpu';

	let ref: BufferGeometry;
	export let intersection: Intersection;
	$: if (intersection && ref) {
		ref.setFromPoints([new Vector3(0, 0, 0), intersection.point.clone()]);
	}
</script>

<div use:portalAction class="absolute top-0 text-white">
	{intersection?.point.x}, {intersection?.point.y}, {intersection?.point.z}
</div>
<T.Line
	renderOrder={100}
	on:create={({ ref }) => {
		ref.onBeforeRender = (renderer) => {
			renderer.clearDepth();
		};
	}}
>
	<T.BufferGeometry bind:ref />
	<T.LineBasicMaterial color="red" />
</T.Line>
