import { Color, Vector3 } from 'three';
import { Pirates } from 'chain';
const DECIMALS_MULTIPLIER = 10 ** Pirates.Constants.DECIMALS;
const QUANISATION_LEVEL = Pirates.Constants.QUANISATION_LEVEL;
const TURN_UNIT = 360 / QUANISATION_LEVEL;
// [-Max,   0  .., Max]
const TURNRATES = Array(Pirates.Constants.MAX_TURN_RATE * 2 + 1)
	.fill(0)
	.map((_, i) => {
		const k = i - Pirates.Constants.MAX_TURN_RATE;
		return k * TURN_UNIT;
	});
export const SUN = {
	COLOR: new Color(0xffddaa)
};
export const SEA = {
	SIZE: Pirates.Constants.WORLD_SIZE / DECIMALS_MULTIPLIER,
	COLOR: {
		LIGHT: new Color(0x306880),
		DARK: new Color(0x206080)
	}
};
export const WORLD = {
	SIZE: Pirates.Constants.WORLD_SIZE / DECIMALS_MULTIPLIER,
	COLOR: new Color(0xa0c0f0)
};
export const CAMERA = {
	OFFSET: new Vector3(0, 40, 40),
	LOOK_AT_OFFSET: new Vector3(0, 0, 0)
};
export const SHIP = {
	SPEED: Pirates.Constants.SHIP_SPEED / DECIMALS_MULTIPLIER,
	SIZE: Pirates.Constants.SHIP_SIZE / DECIMALS_MULTIPLIER,
	INITIAL_HEALTH: Pirates.Constants.INITIAL_SHIP_HEALTH,
	INITIAL_CANNONBALLS: Pirates.Constants.INITIAL_CANNONBALLS,
	INITIAL_GOLD: Pirates.Constants.INITIAL_GOLD,
	TURNRATES: TURNRATES
};
export const GIZMO = {
	SIZE: Pirates.Constants.SHIP_SIZE / DECIMALS_MULTIPLIER
};
export const LOOT = {
	MIN: Pirates.Constants.MIN_LOOT,
	MAX: Pirates.Constants.MAX_LOOT,
	SIZE: Pirates.Constants.LOOT_SIZE / DECIMALS_MULTIPLIER
};
export const CANNON = {
	DAMAGE: Pirates.Constants.CANNON_DAMAGE,
	RANGE: Pirates.Constants.CANNON_RANGE / DECIMALS_MULTIPLIER,
	COST: Pirates.Constants.CANNON_COST,
	SIZE: Pirates.Constants.CANNON_SIZE / DECIMALS_MULTIPLIER,
	WAIT_TIME: Pirates.Constants.CANNON_WAIT_TIME
};
