<script lang="ts" context="module">
	import { Group, PlaneGeometry, Quaternion, RepeatWrapping, Vector2, Vector3 } from 'three';
	import { pos } from './Player.svelte';
	import { SEA } from './Constants';
	const uniforms = {
		time: {
			value: 0
		},
		scale: {
			value: 200
		},
		amp: {
			value: 3
		},
		offsetX: {
			value: 0
		},
		offsetY: {
			value: 0
		}
	};
	export const waves = {
		heightAt: (x: number, y: number) => {
			const pos = new Vector2(x, y).add({ x: uniforms.offsetX.value, y: uniforms.offsetY.value });
			let retVal = pos.clone();
			let ang;
			const kzx = 360.0 / uniforms.scale.value;

			// Wave1 (135 degrees)
			ang = 50.0 * uniforms.time.value + -1.0 * pos.x * kzx + -2.0 * pos.y * kzx;
			ang = ((ang % 360.0) * Math.PI) / 180.0;
			retVal.y = 3.0 * Math.sin(ang);

			// Wave2 (090 degrees)
			ang = 25.0 * uniforms.time.value + -3.0 * pos.x * kzx;
			ang = ((ang % 360.0) * Math.PI) / 180.0;
			retVal.y += 2.0 * Math.sin(ang);

			// Wave3 (180 degrees)
			ang = 15.0 * uniforms.time.value - 3.0 * pos.y * kzx;
			ang = ((ang % 360.0) * Math.PI) / 180.0;
			retVal.y += 2.0 * Math.sin(ang);

			// Wave4 (225 degrees)
			ang = 50.0 * uniforms.time.value + 4.0 * pos.x * kzx + 8.0 * pos.y * kzx;
			ang = ((ang % 360.0) * Math.PI) / 180.0;
			retVal.y += 0.5 * Math.sin(ang);

			// Wave5 (270 degrees)
			ang = 50.0 * uniforms.time.value + 8.0 * pos.x * kzx;
			ang = ((ang % 360.0) * Math.PI) / 180.0;
			retVal.y += 0.5 * Math.sin(ang);

			return retVal.y * uniforms.amp.value * 0.125;
		},
		alignToSurface(obj: Group) {
			// 3 points pinning method
			const offsetX = 1;
			const offsetZ = 1;

			// Sample heights at points
			const sample = obj.position.clone();
			const centerHeight = this.heightAt(sample.x, sample.z);
			const forwardHeight = this.heightAt(sample.x, sample.z + offsetZ);
			const rightHeight = this.heightAt(sample.x + offsetX, sample.z);

			// Create points in local space
			const p0 = new Vector3(0, centerHeight, 0);
			const p1 = new Vector3(0, forwardHeight, offsetZ);
			const p2 = new Vector3(offsetX, rightHeight, 0);

			// Calculate normal
			const normal = new Vector3().crossVectors(p1.clone().sub(p0), p2.clone().sub(p0)).normalize();

			// Ensure normal points upwards
			if (normal.y < 0) normal.negate();

			// Create rotation to align up vector with normal
			const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal);

			// Apply rotation
			obj.quaternion.copy(quaternion);

			// Move obj to correct height
			obj.position.y = centerHeight;

			// Update obj's matrix
			obj.updateMatrix();
		}
	};
	const onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
		shader.uniforms.time = uniforms.time;
		shader.uniforms.scale = uniforms.scale;
		shader.uniforms.amp = uniforms.amp;
		shader.uniforms.offsetX = uniforms.offsetX;
		shader.uniforms.offsetY = uniforms.offsetY;

		shader.vertexShader = `
		        uniform float time;
		        uniform float scale;
				uniform float amp;
				uniform float offsetX;
				uniform float offsetY;
		        varying float vHeight;
		        vec3 moveWave(vec3 p){
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
					vec3 offset=vec3(offsetX,0,offsetY);
		            vec3 p = position+offset;
		            vec2 move = vec2(1, 0);
		            vec3 pos = moveWave(p)-offset;
		            vec3 pos2 = moveWave(p + move.xyy)-offset;
		            vec3 pos3 = moveWave(p + move.yyx)-offset;
		            objectNormal = normalize(cross(normalize(pos2-pos), normalize(pos3-pos)));
		        `
			)
			.replace(
				`#include <begin_vertex>`,
				`#include <begin_vertex>
		            transformed = pos;
		            vHeight = pos.y;
		        `
			);
		shader.fragmentShader = `
				uniform float offsetX;
				uniform float offsetY;
				varying float vHeight;
				${shader.fragmentShader}
			  `
			.replace(
				`#include <color_fragment>`,
				`
			#include <color_fragment>
			diffuseColor.rgb = mix(vec3(${SEA.COLOR.DARK.toArray().join(',')}), vec3(${SEA.COLOR.LIGHT.toArray().join(',')}), smoothstep(0.0, 2.0, vHeight));
			`
			)
			.replace(
				`vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;`,
				`vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.2+ 0.5;`
			)
			.replace(
				`vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;`,
				`vec3 outgoingLight = diffuseColor.rgb * vec3(mix(0.5, 1.0,matcapColor.b));`
			);
	};
	const updateUniforms = (d: number) => {
		uniforms.time.value += d;
		uniforms.offsetX.value = pos.x;
		uniforms.offsetY.value = pos.y;
	};
</script>

<script lang="ts">
	import { T, useTask } from '@threlte/core';

	import { DEG2RAD } from 'three/src/math/MathUtils.js';
	import { useTexture } from '@threlte/extras';
	import type { WebGLProgramParametersWithUniforms } from 'three/src/renderers/webgl/WebGLPrograms.js';
	const sz = 500,
		tx = 20,
		ty = 20;
	const detail = 100;
	let g = new PlaneGeometry(sz, sz, detail, detail).rotateX(-90 * DEG2RAD);
	// const originalPositions = g.attributes.position.array.slice();
	const awaitedNormalMap = useTexture('sea_normal.jpg', {
		transform: (texture) => {
			texture.wrapS = RepeatWrapping;
			texture.wrapT = RepeatWrapping;
			texture.repeat.set(tx, ty);
			return texture;
		}
	});
	const awaitedMatcap = useTexture('matcap_blue.jpg', {});
	useTask((d) => {
		updateUniforms(d);
		if ($awaitedNormalMap) $awaitedNormalMap.offset.set((pos.x * tx) / sz, (-pos.y * ty) / sz);
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
{#await awaitedNormalMap then normalMap}
	{#await awaitedMatcap then matcap}
		<T.Mesh>
			<T is={g} />
			<T.MeshMatcapMaterial
				on:create={({ ref }) => {
					ref.normalMap = normalMap;
					ref.matcap = matcap;
					ref.onBeforeCompile = onBeforeCompile;
				}}
			/>
		</T.Mesh>
	{/await}
{/await}
<!-- <T.Mesh>
	<T is={g} />
	<T is={material} />
</T.Mesh> -->
