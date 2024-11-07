<script lang="ts">
	import * as T from 'three';
	import { T as Th, useTask } from '@threlte/core';
	import { InstancedMeshes } from '@threlte/extras';
	import { Vector3 } from 'three';
	import { useGltf } from '@threlte/extras';
	import type { Mesh } from 'three/src/objects/Mesh.js';
	import { rayCastOnSea } from './Sea.svelte';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { position, rotationY } from '$lib/stores/player';

	const ship = useGltf<{
		nodes: {
			Wood: Mesh;
			WoodDark: Mesh;
			Iron: Mesh;
			Window: Mesh;
			Textile: Mesh;
		};
		materials: {};
	}>('/Ship.glb');

	const chainShipData = [
		{
			position: new Vector3(10, 0, 20),
			rotY: 10 * DEG2RAD
		},
		{
			position: new Vector3(10, 0, 100),
			rotY: 20 * DEG2RAD
		}
	];
	const shipSize = new Vector3(1, 0.5, 2);
	const updateShipData = () =>
		[
			//player ship
			{
				position: $position,
				rotY: $rotationY
			},
			...chainShipData
		].map((s, i) => {
			const { position, normal } = rayCastOnSea(s.position.clone().sub($position), shipSize);
			const quaternion = new T.Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);
			return { ...s, position, quaternion: quaternion };
		});
	let updatedShipData = updateShipData();
	useTask((d) => {
		updatedShipData = updateShipData();
	});

	const loot = useGltf<{
		nodes: {
			Wood: Mesh;
			Stone: Mesh;
		};
		materials: {};
	}>('/Loot.glb');

	const chainLootData = [
		{
			position: new Vector3(5, 0, 1),
			rotY: 10 * DEG2RAD
		},
		{
			position: new Vector3(4, 1, 10),
			rotY: 20 * DEG2RAD
		}
	];
	const lootSize = new Vector3(1, 0.5, 2);
	const updateLootData = () =>
		chainLootData.map((s, i) => {
			const { position, normal } = rayCastOnSea(s.position.clone().sub($position), lootSize);
			const quaternion = new T.Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);
			return { ...s, position, quaternion: quaternion };
		});
	let updatedLootData = updateLootData();
	useTask((d) => {
		updatedLootData = updateLootData();
	});
</script>

{#await ship}
	<slot name="fallback" />
{:then gltf}
	<InstancedMeshes meshes={gltf.nodes} let:components={{ Wood, WoodDark, Iron, Window, Textile }}>
		{#each updatedShipData as d}
			<Th.Group position={d.position.toArray()} quaternion={d.quaternion.toArray()}>
				<Th.Group rotation.y={d.rotY}>
					<Th.Group rotation.x={-Math.PI * 0.05} rotation.y={Math.PI}>
						<Wood />
						<WoodDark />
						<Iron />
						<Window />
						<Textile />
					</Th.Group>
				</Th.Group>
			</Th.Group>
		{/each}
	</InstancedMeshes>
{:catch error}
	<slot name="error" {error} />
{/await}

{#await loot}
	<slot name="fallback" />
{:then gltf}
	<InstancedMeshes meshes={gltf.nodes} let:components={{ Wood, Stone }}>
		{#each updatedLootData as d}
			<Th.Group position={d.position.toArray()} quaternion={d.quaternion.toArray()}>
				<Th.Group rotation.y={d.rotY}>
					<Th.Group rotation.x={-Math.PI * 0.05} rotation.y={Math.PI}>
						<Wood />
						<Stone />
					</Th.Group>
				</Th.Group>
			</Th.Group>
		{/each}
	</InstancedMeshes>
{:catch error}
	<slot name="error" {error} />
{/await}
