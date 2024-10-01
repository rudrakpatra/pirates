<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import Player from './Player.svelte';
	import Sea from './Sea.svelte';
	import { SUN, WORLD } from './Constants';
	import { ACESFilmicToneMapping } from 'three';
	import Clouds from './Clouds.svelte';
	import { CanvasTexture } from 'three/src/textures/CanvasTexture.js';
	import { rgbFromColor } from './Utils';

	const { scene, renderer } = useThrelte();
	export const generateGradientSkyTexture = () => {
		var size = 512;

		// create canvas
		let canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;

		// get context
		let context = canvas.getContext('2d');
		if (!context) throw new Error('Failed to generate texture 2d context not supported');

		// draw gradient
		context.rect(0, 0, size, size);
		var gradient = context.createLinearGradient(0, 0, 0, size);
		gradient.addColorStop(0, rgbFromColor(WORLD.COLOR.DARK));
		gradient.addColorStop(0.5, rgbFromColor(WORLD.COLOR.LIGHT));
		context.fillStyle = gradient;
		context.fill();
		return new CanvasTexture(canvas);
	};
	scene.background = generateGradientSkyTexture();
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.2;
	// renderer.domElement.style.background = 'linear-gradient(to top, #A0DEFF 60%, #5AB2FF 100%)';
</script>

<Player />
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
