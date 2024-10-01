import { useThrelte } from '@threlte/core';
import { BufferAttribute, BufferGeometry, Color, Mesh, Vector2, Vector3 } from 'three';
import type Geometries from 'three/src/renderers/common/Geometries.js';

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

export const computeAngleVertexNormals = function (geometry: BufferGeometry, angle: number): void {
	const weightedNormal = (normals: Vector3[], vector: Vector3): Vector3 => {
		const normal = new Vector3();

		for (let i = 0; i < normals.length; i++) {
			// if (normals[i].angleTo(vector) < angle) {
			normal.add(normals[i]);
			// }
		}

		return normal.normalize();
	};

	// Ensure we have vertex normals
	geometry.computeVertexNormals();

	const positionAttribute = geometry.getAttribute('position') as BufferAttribute;
	const normalAttribute = geometry.getAttribute('normal') as BufferAttribute;
	const indexAttribute = geometry.getIndex();

	if (!indexAttribute) {
		console.error('Geometry must have an index attribute');
		return;
	}

	const vertexCount = positionAttribute.count;
	const normals = normalAttribute.array;
	const indices = indexAttribute.array;

	// Initialize array to store adjacent normals for each vertex
	const adjacentNormals: Vector3[][] = Array(vertexCount)
		.fill(null)
		.map(() => []);

	// Collect adjacent normals for each vertex
	for (let i = 0; i < indices.length; i += 3) {
		const a = indices[i];
		const b = indices[i + 1];
		const c = indices[i + 2];

		const na = new Vector3(normals[a * 3], normals[a * 3 + 1], normals[a * 3 + 2]);
		const nb = new Vector3(normals[b * 3], normals[b * 3 + 1], normals[b * 3 + 2]);
		const nc = new Vector3(normals[c * 3], normals[c * 3 + 1], normals[c * 3 + 2]);

		adjacentNormals[a].push(na, nb, nc);
		adjacentNormals[b].push(na, nb, nc);
		adjacentNormals[c].push(na, nb, nc);
	}

	// Compute weighted normals
	const weightedNormals = new Float32Array(vertexCount * 3);

	for (let i = 0; i < vertexCount; i++) {
		const baseNormal = new Vector3(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]);
		const weighted = weightedNormal(adjacentNormals[i], baseNormal);

		weightedNormals[i * 3] = weighted.x;
		weightedNormals[i * 3 + 1] = weighted.y;
		weightedNormals[i * 3 + 2] = weighted.z;
	}

	// Update the normal attribute with weighted normals
	geometry.setAttribute('normal', new BufferAttribute(weightedNormals, 3));

	// Flag geometry for update
	geometry.attributes.normal.needsUpdate = true;
};

/**
 * Returns a string representing a color in RGB format, given a THREE.Color instance.
 * @param {THREE.Color} color - The color to convert.
 * @returns {string} The color as a string in RGB format, e.g. "rgb(255, 0, 0)".
 */

export const rgbFromColor = (color: Color) => {
	return `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
};
