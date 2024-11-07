<script lang="ts">
	import * as T from 'three';
	import { T as Th, useThrelte } from '@threlte/core';
	import PlayerController from './PlayerController/PlayerController.svelte';
	import Sea from './Sea.svelte';
	import { SUN } from './Constants';
	import Clouds from './Clouds.svelte';
	import Instances from './Instances.svelte';

	const { renderer } = useThrelte();
	renderer.toneMapping = T.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.2;
</script>

<PlayerController />
<Instances />
<!-- <Clouds /> -->
<Sea />
<Th.DirectionalLight
	position.y={10}
	position.z={5}
	castShadow
	shadow.camera.left={-2.5}
	shadow.camera.right={2.5}
	shadow.camera.top={2.5}
	shadow.camera.bottom={-2.5}
	shadow.mapSize.width={1024}
	shadow.mapSize.height={1024}
	color={SUN.COLOR}
/>

<Th.AmbientLight intensity={0.8} />
