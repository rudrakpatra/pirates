<script lang="ts" context="module">
	import { BackSide, CanvasTexture, PlaneGeometry, RepeatWrapping, Vector3 } from 'three';
	import { position as playerPosition } from './Player.svelte';
	import { SEA, WORLD } from './Constants';

	const size = SEA.SIZE * 0.5;
	const detail = 100;

	const uniforms = {
		time: {
			value: 0
		},
		scale: {
			value: 200
		},
		amp: {
			value: 2
		},
		offset: {
			value: new Vector3(0, 0, 0)
		}
	};
	const wave = (p: Vector3): Vector3 => {
		const pos = p.clone();
		const kzx = 360.0 / uniforms.scale.value;
		let ang: number;

		// Wave1 (135 degrees)
		ang = 50.0 * uniforms.time.value + -1.0 * p.x * kzx + -2.0 * p.z * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		pos.y = 3.0 * Math.sin(ang);

		// Wave2 (090 degrees)
		ang = 25.0 * uniforms.time.value + -3.0 * p.x * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		pos.y += 2.0 * Math.sin(ang);

		// Wave3 (180 degrees)
		ang = 15.0 * uniforms.time.value - 3.0 * p.z * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		pos.y += 2.0 * Math.sin(ang);

		// Wave4 (225 degrees)
		ang = 50.0 * uniforms.time.value + 4.0 * p.x * kzx + 8.0 * p.z * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		pos.y += 0.5 * Math.sin(ang);

		// Wave5 (270 degrees)
		ang = 50.0 * uniforms.time.value + 8.0 * p.x * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		pos.y += 0.5 * Math.sin(ang);

		// Apply amplitude
		pos.y *= uniforms.amp.value * 0.125;

		return pos;
	};

	/**
	 * Casts a ray on the sea surface from the given the world position
	 * @param group The object to align
	 * @param position The position to snap to
	 * @returns information about the ray
	 */
	export const rayCastOnSea = (position: Vector3, size: Vector3) => {
		const offset = get(playerPosition);
		const p = position.clone().add(offset);
		// Calculate wave-affected positions
		const pos0 = wave(p).sub(offset);
		const pos1 = wave(p.clone().add(new Vector3(size.x, 0, 0))).sub(offset);
		const pos2 = wave(p.clone().add(new Vector3(0, 0, size.z))).sub(offset);

		// Calculate normal
		const normal = new Vector3()
			.crossVectors(pos1.clone().sub(pos0), pos2.clone().sub(pos0))
			.normalize();

		// Ensure normal points upwards
		if (normal.y < 0) normal.negate();
		return { position: pos0.setY(pos0.y - size.y / 2), normal };
	};
	const onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
		shader.uniforms.time = uniforms.time;
		shader.uniforms.scale = uniforms.scale;
		shader.uniforms.amp = uniforms.amp;
		shader.uniforms.offset = uniforms.offset;

		shader.vertexShader = `
		        uniform float time;
		        uniform float scale;
				uniform float amp;
				uniform vec3 offset;
		        varying vec3 vpos;
		        vec3 wave(vec3 p){
		            vec3 retVal = p;
		            float ang;
		            float kzx = 360.0/scale;
		            // Wave1 (135 degrees)
		            ang = 50.0*time + -1.0*p.x*kzx + -2.0*p.z*kzx;
		            ang = mod(ang, 360.0) * 3.14159265/180.0;
		            retVal.y = 3.0*sin(ang);
		            // Wave2 (090)
		            ang = 25.0*time + -3.0*p.x*kzx;
		            ang = mod(ang, 360.0) * 3.14159265/180.0;
		            retVal.y = retVal.y + 2.0*sin(ang);
		            // Wave3 (180 degrees)
		            ang = 15.0*time - 3.0*p.z*kzx;
		            ang = mod(ang, 360.0) * 3.14159265/180.0;
		            retVal.y = retVal.y + 2.0*sin(ang);
		            // Wave4 (225 degrees)
		            ang = 50.0*time + 4.0*p.x*kzx + 8.0*p.z*kzx;
		            ang = mod(ang, 360.0) * 3.14159265/180.0;
		            retVal.y = retVal.y + 0.5*sin(ang);
		            // Wave5 (270 degrees)
		            ang = 50.0*time + 8.0*p.x*kzx;
		            ang = mod(ang, 360.0) * 3.14159265/180.0;
		            retVal.y = retVal.y + 0.5*sin(ang);
					retVal.y = retVal.y * amp * 0.125;
		            return retVal;
		        }
		        ${shader.vertexShader}
		    `
			.replace(
				`#include <beginnormal_vertex>`,
				`#include <beginnormal_vertex>
		            vec3 p = position+offset;
		            vec2 move = vec2(1, 0);
					vec3 pos0 = wave(p)-offset;
					vec3 pos1 = wave(p + move.xyy)-offset;
		            vec3 pos2 = wave(p + move.yyx)-offset;
		            objectNormal = normalize(cross(pos1-pos0, pos2-pos0));
		        `
			)
			.replace(
				`#include <begin_vertex>`,
				`#include <begin_vertex>
					transformed = pos0;
					pos0.y*=smoothstep(1.0,0.0,length(pos0.xz)/${(size / 2).toFixed(1)});
		            vpos = pos0;
		        `
			);
		shader.fragmentShader = `
		 		uniform float time;
				varying vec3 vpos;
				${shader.fragmentShader}
			  `
			.replace(
				`#include <map_fragment>`,
				`//time based noise wiggle
				vec2 noise=vec2(sin(vMapUv.x*3.14+time*2.0)*0.01,cos(vMapUv.y*3.14+time*2.0)*0.01);
			 	#ifdef USE_MAP\n\t\
				vec4 sampledDiffuseColor = texture2D( map, vMapUv+noise);\n\t\
				#ifdef DECODE_VIDEO_TEXTURE\n\t\t\
				sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );\n\t\n\t\
				#endif\n\t\
				diffuseColor *= sampledDiffuseColor;\n#endif
				diffuseColor = mix( diffuseColor*diffuseColor,diffuseColor, 0.5 + vpos.y*0.2 );
				float l=length(vpos.xz);
				float r=${(size / 2).toFixed(1)};
				diffuseColor.a=l<r?1.0:0.0;
				`
			)
			.replace(
				`vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;`,
				`
			vec3 gradColor = mix(vec3(${SEA.COLOR.DARK.toArray().join(',')}), vec3(${SEA.COLOR.LIGHT.toArray().join(',')}), smoothstep(0.0, 1.0, vpos.y));
			vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
			totalDiffuse = mix(totalDiffuse+gradColor , totalDiffuse+gradColor * 1.1, smoothstep(0.0, 1.0, vpos.y));
			vec3 sky=vec3(${WORLD.COLOR.LIGHT.toArray().join(',')});
			float factor=smoothstep(1.0,0.0,pow(l/r,4.0));
			totalDiffuse=mix(sky,totalDiffuse,factor);
			`
			);
		console.log(shader.fragmentShader);
	};
	const updateUniforms = (d: number) => {
		uniforms.time.value += d;
		uniforms.offset.value.set(get(playerPosition).x, 0, get(playerPosition).z);
	};
</script>

<script lang="ts">
	import { T, useTask } from '@threlte/core';

	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { useTexture } from '@threlte/extras';
	import type { WebGLProgramParametersWithUniforms } from 'three/src/renderers/webgl/WebGLPrograms.js';
	import { get } from 'svelte/store';
	import { rgbFromColor } from './Utils';
	//texture
	const repeatX = 15,
		repeatY = 15;

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
		var gradient = context.createLinearGradient(0, size, 0, 0);
		gradient.addColorStop(0.6, rgbFromColor(WORLD.COLOR.DARK));
		gradient.addColorStop(0.5, rgbFromColor(WORLD.COLOR.LIGHT));
		context.fillStyle = gradient;
		context.fill();
		return new CanvasTexture(canvas);
	};

	const awaitedMap = useTexture('sea.jpg', {
		transform: (texture) => {
			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;
			texture.repeat.set(repeatX, repeatY);
			return texture;
		}
	});
	useTask((d) => {
		updateUniforms(d);
		if ($awaitedMap)
			$awaitedMap.offset.set(
				($playerPosition.x * repeatX) / size,
				(-$playerPosition.z * repeatY) / size
			);
	});
</script>

<T.AxesHelper
	args={[2]}
	renderOrder={200}
	on:create={({ ref }) => {
		ref.onBeforeRender = function (renderer) {
			renderer.clearDepth();
		};
	}}
/>
<T.Mesh>
	<T.SphereGeometry args={[size, 32, 32]} position={[0, size, 0]} />
	<T.MeshBasicMaterial side={BackSide} map={generateGradientSkyTexture()} />
</T.Mesh>
{#await awaitedMap then map}
	<T.Mesh>
		<T is={new PlaneGeometry(size, size, detail, detail).rotateX(-90 * DEG2RAD)} />
		<T.MeshStandardMaterial {map} alphaTest={0.5} {onBeforeCompile} />
	</T.Mesh>
{/await}
