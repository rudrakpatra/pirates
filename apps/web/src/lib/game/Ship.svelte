<script lang="ts">
	import { Group } from 'three';
	import { T, useTask, forwardEventHandlers } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	import { waves } from './Sea.svelte';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	export const ref = new Group();
	const model = new Group();
	const gltf = useGltf('/Ship.glb');
	const component = forwardEventHandlers();
	const dip = 0.2;
	useTask((d) => {
		waves.alignToSurface(model);
		model.position.y -= dip;
	});
</script>

<T is={ref} dispose={false} {...$$restProps} bind:this={$component}>
	{#await gltf}
		<slot name="fallback" />
	{:then gltf}
		<T is={model}>
			<T.Group rotation.x={-Math.PI * 0.05} rotation.y={Math.PI}>
				<T.Mesh
					geometry={gltf.nodes.ship_light_8angles_1.geometry}
					material={gltf.materials['wood.001']}
				/>
				<T.Mesh
					geometry={gltf.nodes.ship_light_8angles_2.geometry}
					material={gltf.materials.woodDark}
				/>
				<T.Mesh
					geometry={gltf.nodes.ship_light_8angles_3.geometry}
					material={gltf.materials.iron}
				/>
				<T.Mesh
					geometry={gltf.nodes.ship_light_8angles_4.geometry}
					material={gltf.materials.window}
				/>
				<T.Mesh
					geometry={gltf.nodes.ship_light_8angles_5.geometry}
					material={gltf.materials.textile}
				/>
				<T.Mesh
					geometry={gltf.nodes.ship_light_8angles_6.geometry}
					material={gltf.materials._defaultMat}
				/>
			</T.Group>
		</T>
	{:catch error}
		<slot name="error" {error} />
	{/await}

	<slot {ref} />
</T>
