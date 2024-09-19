import {
	Scene,
	WebGLRenderer,
	OrthographicCamera,
	Clock,
	Color,
	FogExp2,
	Vector3,
	AmbientLight,
	DirectionalLight,
	PCFSoftShadowMap,
	Object3D,
	Mesh,
	BoxGeometry,
	MeshBasicMaterial,
	Vector2,
	GridHelper
} from 'three';
import { Sea } from './Sea';
import { UIManager } from './UIManager';
import { LootManager } from './LootManager';
import { PlayerManager } from './PlayerManager';
import { CAMERA, LOOT, SHIP, WORLD } from './Constants';
import { load, loadProxy } from './Load';
export class GameInstance {
	scene: Scene;
	renderer: WebGLRenderer;
	camera: OrthographicCamera;
	// sea: Sea;
	clock: Clock;

	uiManager: UIManager;
	lootManager: LootManager;
	playerManager: PlayerManager;
	loadedAssetLevel = 0;
	frustrumSize = SHIP.SIZE * 4;
	size = new Vector2(WORLD.SIZE, WORLD.SIZE);
	canvas: HTMLCanvasElement;
	playerPubKeyBase58?: string;

	constructor() {
		// Initialize scene
		this.scene = new Scene();
		//add boxes to 0,0,0 0,0,WORLD_SIZE
		//gridHelper
		this.scene.add(new GridHelper(this.size.x, this.size.y, 0x555555, 0x555555));
		this.scene.background = new Color(0x00284a);
		// this.scene.fog = new FogExp2(0x00284a, 0.002);

		// Initialize renderer
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.size.x, this.size.y);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = PCFSoftShadowMap;
		this.renderer.setAnimationLoop(this.loop.bind(this));
		this.canvas = this.renderer.domElement;

		// Initialize camera
		const aspect = this.size.x / this.size.y;
		this.camera = new OrthographicCamera(
			(this.frustrumSize * aspect) / -2,
			(this.frustrumSize * aspect) / 2,
			this.frustrumSize / 2,
			this.frustrumSize / -2,
			0.1,
			1000
		);

		this.camera.position.set(CAMERA.OFFSET.x, CAMERA.OFFSET.y, CAMERA.OFFSET.z);
		this.camera.lookAt(new Vector3(0, 0, 0).add(CAMERA.LOOK_AT_OFFSET));

		// Initialize sea
		// this.sea = new Sea(this.size);
		// this.scene.add(this.sea.getMesh());
		// this.scene.add(this.sea.getFoamParticles());

		// Initialize managers
		this.uiManager = new UIManager(
			this.size,
			this.scene,
			this.camera,
			this.canvas,
			this.playerPubKeyBase58
		);
		this.lootManager = new LootManager(this.scene);
		this.playerManager = new PlayerManager(this.scene);

		// Initialize clock
		this.clock = new Clock(true);

		// Add lights
		this.addLights();
	}

	private addLights() {
		const dirLight = new DirectionalLight(0xffffff, 10);
		dirLight.position.set(50, 200, 50);
		dirLight.castShadow = true;
		dirLight.shadow.mapSize.width = 2048;
		dirLight.shadow.mapSize.height = 2048;
		dirLight.shadow.camera.near = 1;
		dirLight.shadow.camera.far = 500;
		dirLight.shadow.bias = -0.001;
		this.scene.add(dirLight);

		const ambientLight = new AmbientLight(0x554433, 10);
		this.scene.add(ambientLight);

		const { ship, loot, cannonball } = loadProxy();
		this.playerManager.setShipModel(ship);
		this.playerManager.setCannonBallModel(cannonball);
		this.lootManager.setLootModel(loot);
		this.loadedAssetLevel = 1;
	}

	async loadAssets() {
		const { ship, loot, cannonball } = await load();
		this.playerManager.setShipModel(ship);
		this.playerManager.setCannonBallModel(cannonball);
		this.lootManager.setLootModel(loot);
		this.loadedAssetLevel = 2;
	}

	update() {
		const delta = this.clock.getDelta();
		this.playerManager.update(delta);
		this.lootManager.update(delta);
		this.checkLootCollection();
		// this.sea.update(delta);
		this.updateSceneObjects();
		this.uiManager.update();
	}

	private checkLootCollection() {
		if (!this.playerPubKeyBase58) return;
		const playerShip = this.scene.getObjectByName(this.playerPubKeyBase58);
		if (!playerShip) return;

		const playerPosition = new Vector3();
		playerShip.getWorldPosition(playerPosition);

		const loots: Object3D[] = [];
		this.scene.traverse((child) => {
			if (child.name === 'loot') {
				loots.push(child);
			}
		});

		for (let i = loots.length - 1; i >= 0; i--) {
			const loot = loots[i];
			const lootPosition = new Vector3();
			loot.getWorldPosition(lootPosition);

			const player = this.playerManager.getPlayer(this.playerPubKeyBase58);
			if (player && lootPosition.distanceTo(playerPosition) < player.ship.circle.r + LOOT.SIZE) {
				loot.removeFromParent();
				this.onLootCollection(loot.id);
				loots.splice(i, 1);
			}
		}
	}

	onLootCollection = async (id: number) => {
		// Implement your loot collection logic here
		console.log(`Loot collected: ${id}`);
		// You can emit an event or call a callback function here
	};

	private updateSceneObjects() {
		this.scene.traverse((child) => {
			if (child.userData.type === 'ship' || child.userData.type === 'loot') {
				// this.sea.addWeight(child);
				// this.sea.align(child);
			}
		});
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	loop() {
		this.update();
		this.resize();
		this.render();
	}

	setFromPiratesState(state: any) {
		this.playerManager.syncState(state.players);
		this.lootManager.syncState(state.loots);
	}

	resize() {
		const parentElement = this.canvas.parentElement;
		if (!parentElement) return;
		const rect = parentElement.getBoundingClientRect();
		if (this.canvas.width === rect.width && this.canvas.height === rect.height) return;
		this.canvas.width = rect.width;
		this.canvas.height = rect.height;

		const aspect = this.canvas.width / this.canvas.height;
		this.camera.left = (this.frustrumSize * aspect) / -2;
		this.camera.right = (this.frustrumSize * aspect) / 2;
		this.camera.top = this.frustrumSize / 2;
		this.camera.bottom = this.frustrumSize / -2;

		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.canvas.width, this.canvas.height);
	}

	cleanup() {
		this.uiManager.cleanup();
		this.playerManager.cleanup();
		this.lootManager.cleanup();
		this.renderer.dispose();
		// window.removeEventListener('resize', this.resize.bind(this));
	}
}
