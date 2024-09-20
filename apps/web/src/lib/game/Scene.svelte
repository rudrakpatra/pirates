<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import Player from './Player.svelte';
	import Sea from './Sea.svelte';
	import { FogExp2 } from 'three';
	const { scene } = useThrelte();
	// scene.fog = new FogExp2(0x40f8fa, 0.002);
</script>

<Player />
<Sea />
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
	color="#ddaa88"
/>

<T.AmbientLight intensity={0.5} />

<T.OrthographicCamera makeDefault position={[100, 100, 100]} zoom={20}>
	<OrbitControls
		enablePan={false}
		maxZoom={20}
		minZoom={15}
		maxPolarAngle={Math.PI * 0.45}
		minPolarAngle={0}
	/>
</T.OrthographicCamera>
