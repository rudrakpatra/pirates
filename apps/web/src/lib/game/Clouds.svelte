<script lang="ts" context="module">
	import { Vector3, type WebGLProgramParametersWithUniforms } from 'three';
	import { position } from './Player.svelte';
	const uniforms = {
		time: {
			value: 0
		},
		scale: {
			value: 80
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
	const onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
		shader.uniforms.time = uniforms.time;
		shader.uniforms.scale = uniforms.scale;
		shader.uniforms.amp = uniforms.amp;
		shader.uniforms.offsetX = uniforms.offsetX;
		shader.uniforms.offsetY = uniforms.offsetY;
		// Vertex Shader Modification
		shader.vertexShader = `
			attribute float id;
            uniform float time;
            uniform float scale;
            uniform float amp;
            uniform float offsetX;
            uniform float offsetY;
            varying float vThickness;
            // Noise function
            float noise(vec3 p) {
				float x=p.x*4.243+time/50.0;
				float y=p.y*4.190+time/50.0;
				float z=p.z*4.393+time/50.0;
                return abs(sin(y)+0.5*sin(0.9*x+0.7*z+id*11.0));
            }
            
            // Fractal Brownian Motion
            float fbm(vec3 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 0.0;
                for (int i = 0; i < 2; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            // Function to create an orthogonal vector
            vec3 createOrthogonal(vec3 v) {
                float x = abs(v.x);
                float y = abs(v.y);
                float z = abs(v.z);
                vec3 other = x < y ? (x < z ? vec3(1, 0, 0) : vec3(0, 0, 1)) : (y < z ? vec3(0, 1, 0) : vec3(0, 0, 1));
                return normalize(cross(v, other));
            }
    ${shader.vertexShader}
`.replace(
			`#include <begin_vertex>`,
			`
    #include <begin_vertex>
    // Modify position
    vec3 nn=vec3(normal.x,normal.y*mix(1.5,0.2,-normal.y),normal.z)*1.0;
	float f=fbm(position * 0.5 + nn * 0.2 + time * 0.02)*0.5;
    vec3 displacedPosition = position + nn * f;

    // Calculate new normal
    vec3 tangent = createOrthogonal(nn);
    vec3 bitangent = normalize(cross(nn, tangent));
    vec3 neighbour1 = position + tangent * 0.1;
    vec3 neighbour2 = position + bitangent * 0.1;
    vec3 displacedNeighbour1 = neighbour1 + nn * f;
    vec3 displacedNeighbour2 = neighbour2 + nn * f;
    
    vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
    vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
    
    vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
    
    // Update position and normal
    transformed = displacedPosition;
    objectNormal = displacedNormal;

    // Update thickness
    vThickness = length(displacedPosition - position);
    `
		);
		// Fragment Shader Modification
		shader.fragmentShader = `
            uniform float time;
            uniform float scale;
            uniform float amp;
            uniform float offsetX;
            uniform float offsetY;
            varying float vThickness;
		    ${shader.fragmentShader}
        `.replace(
			`vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;`,

			`
			matcapColor = vec4( vec3( mix( 0.2, 1.0, uv.y ) ), 1.0 );
			vec3 outgoingLight = vec3(matcapColor.rgb*1.5+0.5*smoothstep(-0.2,1.0,vThickness));
            outgoingLight*=mix(vec3(0.2,0.6,1.0),vec3(1.0),(uv.y+uv.x)*0.1);
            `
		);
	};

	const updateUniforms = (d: number) => {
		uniforms.time.value += d;
		uniforms.offsetX.value = get(position).x;
		uniforms.offsetY.value = get(position).y;
	};
</script>

<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { InstancedMesh, Instance } from '@threlte/extras';
	import { WORLD } from './Constants';
	import { get } from 'svelte/store';
	import { InstancedBufferAttribute } from 'three/src/core/InstancedBufferAttribute.js';
	const generateClouds = (n = 6) => {
		const minHeight = 20;
		const maxHeight = 50;
		const cloudSize = 4;
		const size = WORLD.SIZE / 2;
		const rand = (a: number, b: number) => {
			return Math.random() * (b - a) + a;
		};
		let clouds = [];
		for (let i = 0; i <= n; i++) {
			for (let j = 0; j <= n; j++) {
				let position = new Vector3((i * size) / n, rand(minHeight, maxHeight), (j * size) / n);
				position.sub(new Vector3(size * 0.5, 0, size * 0.5));
				position.copy(position.clone().lerp(position.clone().setLength(size), 0.4));
				position.add(new Vector3(rand(-cloudSize, cloudSize * 2), 0, rand(-cloudSize, cloudSize)));
				const big = Math.random() > 0.8 ? 2 : 1;
				const sx = rand(3.0, 5.0) * cloudSize * big;
				const sy = rand(1.5, 1.8) * cloudSize * big;
				const sz = rand(2.0, 3.5) * cloudSize * big;
				const scale = new Vector3(sx, sy, sz);
				const ry = Math.atan2(position.x, position.z) + rand(0, Math.PI * 0.5);
				const rotation = new Vector3(0, ry, 0);
				clouds.push({ position, scale, rotation });
			}
		}
		return clouds;
	};

	const clouds = generateClouds(5);
	const ids = new Float32Array(clouds.length).fill(0).map((_) => Math.random());

	useTask((d) => {
		updateUniforms(d);
	});
</script>

<InstancedMesh>
	<T.IcosahedronGeometry
		args={[1, 5]}
		on:create={({ ref }) => {
			ref.setAttribute('id', new InstancedBufferAttribute(ids, 1));
		}}
	/>
	<T.MeshMatcapMaterial color="white" {onBeforeCompile} />
	{#each clouds as cloud}
		<Instance
			position={cloud.position.toArray()}
			rotation={cloud.rotation.toArray()}
			scale={cloud.scale.toArray()}
		/>
	{/each}
</InstancedMesh>
