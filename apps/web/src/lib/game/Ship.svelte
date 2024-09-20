<script lang="ts">
	import { Group } from 'three';
	import { T, forwardEventHandlers } from '@threlte/core';
	import { useGltf } from '@threlte/extras';
	export const ref = new Group();
	const gltf = useGltf('/Ship.glb');
	const component = forwardEventHandlers();
</script>

<T is={ref} dispose={false} {...$$restProps} bind:this={$component}>
	{#await gltf}
		<slot name="fallback" />
	{:then gltf}
		<T.Mesh
			geometry={gltf.nodes.ship_light_8angles_1.geometry}
			material={gltf.materials['wood.001']}
		/>
		<T.Mesh
			geometry={gltf.nodes.ship_light_8angles_2.geometry}
			material={gltf.materials.woodDark}
		/>
		<T.Mesh geometry={gltf.nodes.ship_light_8angles_3.geometry} material={gltf.materials.iron} />
		<T.Mesh geometry={gltf.nodes.ship_light_8angles_4.geometry} material={gltf.materials.window} />
		<T.Mesh geometry={gltf.nodes.ship_light_8angles_5.geometry} material={gltf.materials.textile} />
		<T.Mesh
			geometry={gltf.nodes.ship_light_8angles_6.geometry}
			material={gltf.materials._defaultMat}
		/>
	{:catch error}
		<slot name="error" {error} />
	{/await}

	<slot {ref} />
</T>
