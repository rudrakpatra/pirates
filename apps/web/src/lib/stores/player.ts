import { writable } from 'svelte/store';
import * as T from 'three';
import { CANNON, SHIP } from '../game/Constants';

/**
 * to be received via periodic fetch calls to the world tracker
 */
export type PlayerData = {
	pubKey: string;
	ship: ShipData;
	inventory: InventoryData;
};
export type InventoryData = { cannonballs: number };
export type ShipData = { x: number; y: number; ang: number };

export type FoamData = { pos: T.Vector3; quaternion: T.Quaternion };

export type CannonData = { pos: T.Vector3; quaternion: T.Quaternion };
export type CannonFireData = { pos: T.Vector3; quaternion: T.Quaternion };
export type CannonBlastData = { pos: T.Vector3; quaternion: T.Quaternion };
export type CannonHitData = { pos: T.Vector3; quaternion: T.Quaternion };

export let position = writable(new T.Vector3(0, 0, 0));
export let velocity = writable(new T.Vector3(0, 0, 0));
export let rotationY = writable(0);
export let quaternion = writable(new T.Quaternion());
export let health = writable(SHIP.INITIAL_HEALTH);
export let cannonballs = writable(SHIP.INITIAL_CANNONBALLS);
export let gold = writable(SHIP.INITIAL_GOLD);
export let turnRate = writable(Math.floor(SHIP.TURNRATES.length / 2));
export let pointer = writable(new T.Vector2(0, 0));
export let aimOffset = writable(new T.Vector3(0, 0, 0));
