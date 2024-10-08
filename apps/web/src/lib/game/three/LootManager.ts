import { Scene, Object3D, Mesh } from 'three';
import { Pirates } from 'chain';

export class LootManager {
	private lootModel: Object3D = new Object3D();
	private loots: Map<string, Object3D> = new Map();

	constructor(private scene: Scene) {}

	setLootModel(model: Object3D) {
		this.lootModel = model;
		this.scene.traverse((child) => {
			if (child.userData.type == 'loot') {
				const parent = child.parent;
				if (parent) {
					child.removeFromParent();
					const instance = this.lootModel.clone();
					instance.name = child.name;
					instance.position.copy(child.position);
					instance.rotation.copy(child.rotation);
					parent.add(instance);
				}
			}
		});
	}

	update(delta: number) {
		// Update loot objects if needed
	}

	syncState(loots: Record<string, Pirates.Proxy.ProxyLoot>) {
		// Remove loots that are no longer in the state
		for (const [id, lootObject] of this.loots) {
			if (!loots[id]) {
				this.scene.remove(lootObject);
				this.loots.delete(id);
			}
		}

		// Update or add loots
		for (const [id, lootData] of Object.entries(loots)) {
			if (this.loots.has(id)) {
				this.updateLoot(id, lootData);
			} else {
				this.addLoot(id, lootData);
			}
		}
	}

	private updateLoot(id: string, lootData: Pirates.Proxy.ProxyLoot) {
		const lootObject = this.loots.get(id);
		if (lootObject) {
			lootObject.position.set(lootData.circle.x, 0, lootData.circle.y);
		}
	}

	private addLoot(id: string, lootData: Pirates.Proxy.ProxyLoot) {
		if (!this.lootModel) {
			console.error('Loot model not set');
			return;
		}
		const newLoot = this.lootModel.clone();
		newLoot.position.set(lootData.circle.x, 0, lootData.circle.y);
		this.scene.add(newLoot);
		this.loots.set(id, newLoot);
	}

	cleanup() {
		for (const lootObject of this.loots.values()) {
			this.scene.remove(lootObject);
		}
		this.loots.clear();
	}
}
