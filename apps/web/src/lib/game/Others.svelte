<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { InstancedMeshes } from '@threlte/extras';
	import { Vector3 } from 'three';
	import { useGltf } from '@threlte/extras';
	import type { Mesh } from 'three/src/objects/Mesh.js';
	import { rayCastOnSea } from './Sea.svelte';
	import { Quaternion } from 'three/src/math/Quaternion.js';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { position as playerPosition } from './Player.svelte';
	import { SHIP } from './Constants';

	const gltf = useGltf<{
		nodes: {
			Wood: Mesh;
			WoodDark: Mesh;
			Iron: Mesh;
			Window: Mesh;
			Textile: Mesh;
		};
		materials: {};
	}>('/Ship2.glb');
	const src = [
		{
			position: new Vector3(10, 0, 20),
			rotY: 10 * DEG2RAD,
			quaternion: new Quaternion()
		},
		{
			position: new Vector3(10, 0, 100),
			rotY: 20 * DEG2RAD,
			quaternion: new Quaternion()
		}
	];
	const dest = [...src];
	const size = new Vector3(1, 0.5, 2);
	useTask((d) => {
		src.forEach((other, i) => {
			const { position, normal } = rayCastOnSea(other.position.clone().sub($playerPosition), size);
			const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);
			dest[i] = { ...other, position, quaternion: quaternion };
		});
	});
</script>

{#await gltf}
	<slot name="fallback" />
{:then gltf}
	<InstancedMeshes meshes={gltf.nodes} let:components={{ Wood, WoodDark, Iron, Window, Textile }}>
		{#each dest as d}
			<T.Group position={d.position.toArray()} quaternion={d.quaternion.toArray()}>
				<T.Group rotation.y={d.rotY}>
					<T.Group rotation.x={-Math.PI * 0.05} rotation.y={Math.PI}>
						<Wood />
						<WoodDark />
						<Iron />
						<Window />
						<Textile />
					</T.Group>
				</T.Group>
			</T.Group>
		{/each}
	</InstancedMeshes>
{:catch error}
	<slot name="error" {error} />
{/await}
