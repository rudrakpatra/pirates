import { useThrelte } from '@threlte/core';
import { Group, MeshStandardMaterial, Quaternion, Vector2, Vector3 } from 'three';
import { uniform } from 'three/webgpu';

export function generateRandomPointsInGrid(
	x: number,
	y: number,
	sz: number,
	amt: number
): Float32Array {
	const particleCount = x * y;
	const array = new Float32Array(particleCount * 3);
	for (let i = 0; i < x; i++) {
		for (let j = 0; j < y; j++) {
			const i3 = 3 * (i * y + j);
			const base = new Vector2(i * sz, j * sz);
			const displacement = new Vector2(Math.random(), Math.random())
				.normalize()
				.multiplyScalar(amt);
			array[i3] = base.x + displacement.x;
			array[i3 + 1] = 0;
			array[i3 + 2] = base.y + displacement.y;
		}
	}
	return array;
}

let time = Date.now();

let shaderMaterial = new MeshStandardMaterial({
	color: 0x0088aa,
	roughness: 1
});
shaderMaterial.onBeforeCompile = (shader) => {
	shader.uniforms.time = { value: time };
	shader.uniforms.grid = { value: sea.scale };

	shader.vertexShader = `
		uniform float time;
		uniform float grid;  
		varying float vHeight;
		vec3 moveWave(vec3 p){
			vec3 retVal = p;
			float ang;
			float kzx = 360.0/grid;
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
			return retVal;
		}					
		${shader.vertexShader}
	`
		.replace(
			`#include <beginnormal_vertex>`,
			`#include <beginnormal_vertex>
			vec3 p = position;
			vec2 move = vec2(1, 0);
			vec3 pos = moveWave(p);
			vec3 pos2 = moveWave(p + move.xyy);
			vec3 pos3 = moveWave(p + move.yyx);
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
		varying float vHeight;
		${shader.fragmentShader}
	  `.replace(
		`#include <color_fragment>`,
		`#include <color_fragment>
		  diffuseColor.rgb = mix(vec3(0.0,0.3,0.7), vec3(0.05,0.4,0.65), smoothstep(0.0, 6.0, vHeight));
		`
	);
};

export const sea = {
	scale: 0.01,
	amp: 0.5,
	uniform: {
		time: { value: 0 },
		grid: { value: 0.01 }
	},
	get material(): MeshStandardMaterial {
		return shaderMaterial;
	},
	update: (d: number) => {
		time += d;
	},
	heightAt: (x: number, y: number) => {
		const pos = new Vector2(x, y);
		let retVal = pos.clone();
		let ang;
		const kzx = 360.0 * sea.scale;

		// Wave1 (135 degrees)
		ang = 50.0 * time + -1.0 * pos.x * kzx + -2.0 * pos.y * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		retVal.y = 3.0 * Math.sin(ang);

		// Wave2 (090 degrees)
		ang = 25.0 * time + -3.0 * pos.x * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		retVal.y += 2.0 * Math.sin(ang);

		// Wave3 (180 degrees)
		ang = 15.0 * time - 3.0 * pos.y * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		retVal.y += 2.0 * Math.sin(ang);

		// Wave4 (225 degrees)
		ang = 50.0 * time + 4.0 * pos.x * kzx + 8.0 * pos.y * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		retVal.y += 0.5 * Math.sin(ang);

		// Wave5 (270 degrees)
		ang = 50.0 * time + 8.0 * pos.x * kzx;
		ang = ((ang % 360.0) * Math.PI) / 180.0;
		retVal.y += 0.5 * Math.sin(ang);

		return (retVal.y * sea.amp) / (3 + 2 + 2 + 0.5 + 0.5);
	},
	alignToSurface(obj: Group) {
		// 3 points pinning method
		const offsetX = 1;
		const offsetZ = 1;
		const v = new Vector3();

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

export const portalAction = (el: HTMLElement) => {
	const { renderer } = useThrelte();
	const target = renderer.domElement.parentElement;
	if (!target) {
		console.warn('HTML: target is undefined.');
		return;
	}
	target.appendChild(el);
	return {
		destroy: () => {
			if (!el.parentNode) return;
			el.parentNode.removeChild(el);
		}
	};
};
