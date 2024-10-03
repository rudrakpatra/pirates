<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import Player from './Player.svelte';
	import Sea from './Sea.svelte';
	import { SUN, WORLD } from './Constants';
	import { ACESFilmicToneMapping } from 'three';
	import Clouds from './Clouds.svelte';
	import { CanvasTexture } from 'three/src/textures/CanvasTexture.js';
	import { rgbFromColor } from './Utils';
	import Others from './Others.svelte';

	const { scene, renderer } = useThrelte();
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.2;
	// renderer.domElement.style.background = 'linear-gradient(to top, #A0DEFF 60%, #5AB2FF 100%)';
</script>

<Player />
<Others />
<Clouds />
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
	color={SUN.COLOR}
/>

<T.AmbientLight intensity={0.8} />
