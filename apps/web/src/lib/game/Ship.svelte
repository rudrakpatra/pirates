<script lang="ts">
	import { Group } from 'three';
	import { T, useTask, forwardEventHandlers } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { rayCastOnSea } from './Sea.svelte';
	import { Vector3 } from 'three/src/math/Vector3.js';
	import { position as playerPosition } from './Player.svelte';
	import { Quaternion } from 'three/src/math/Quaternion.js';
	export const ref = new Group();
	const model = new Group();
	const gltf = useGltf('/Ship2.glb');
	const component = forwardEventHandlers();
	const size = new Vector3(1, 0.5, 2);
	useTask((d) => {
		const { position, normal } = rayCastOnSea(ref.position.sub($playerPosition), size);
		const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);
		model.position.copy(position);
		model.quaternion.copy(quaternion);
		model.updateMatrix();
	});
</script>

<T is={ref} dispose={false} {...$$restProps} bind:this={$component}>
	{#await gltf}
		<slot name="fallback" />
	{:then gltf}
		<T is={model}>
			<T.Group rotation.x={-Math.PI * 0.05} rotation.y={Math.PI}>
				<T.Mesh geometry={gltf.nodes.Wood.geometry} material={gltf.materials.wood} />
				<T.Mesh geometry={gltf.nodes.WoodDark.geometry} material={gltf.materials.woodDark} />
				<T.Mesh geometry={gltf.nodes.Iron.geometry} material={gltf.materials.iron} />
				<T.Mesh geometry={gltf.nodes.Window.geometry} material={gltf.materials.window} />
				<T.Mesh geometry={gltf.nodes.Textile.geometry} material={gltf.materials.textile} />
			</T.Group>
		</T>
	{:catch error}
		<slot name="error" {error} />
	{/await}

	<slot {ref} />
</T>
