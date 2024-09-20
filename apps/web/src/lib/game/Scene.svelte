<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { DoubleSide } from 'three';
	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import Player from './Player.svelte';
</script>

<Player />

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

<T.Mesh receiveShadow rotation.x={-90 * DEG2RAD}>
	<T.PlaneGeometry args={[5, 5]} />
	<T.MeshStandardMaterial color="#22aaff" side={DoubleSide} />
</T.Mesh>

<T.AmbientLight intensity={0.5} />

<T.OrthographicCamera makeDefault position={[100, 100, 100]} zoom={30}>
	<OrbitControls enablePan={false} maxZoom={30} maxPolarAngle={Math.PI * 0.4} minPolarAngle={0} />
</T.OrthographicCamera>
