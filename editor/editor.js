import { Mesh, MeshBasicMaterial, Raycaster, SphereBufferGeometry, Vector2 } from "three";
import { ChunkHelper, Sphere } from "../src";
import { Button } from "./controls/button.js";
import { OctreeHelper } from "./octree-helper.js";

/**
 * A mouse position.
 *
 * @property MOUSE
 * @type Vector2
 * @private
 * @static
 * @final
 */

const MOUSE = new Vector2();

/**
 * A volume editor.
 *
 * @class Editor
 * @implements EventListener
 * @constructor
 * @param {Terrain} terrain - A terrain instance.
 * @param {Camera} camera - A camera.
 * @param {Element} [dom=document.body] - A dom element.
 */

export class Editor {

	constructor(terrain, camera, dom = document.body) {

		/**
		 * A terrain.
		 *
		 * @property terrain
		 * @type Terrain
		 * @private
		 */

		this.terrain = terrain;

		/**
		 * A camera.
		 *
		 * @property camera
		 * @type PerspectiveCamera
		 * @private
		 */

		this.camera = camera;

		/**
		 * A dom element.
		 *
		 * @property dom
		 * @type Element
		 * @private
		 */

		this.dom = dom;

		/**
		 * A raycaster.
		 *
		 * @property raycaster
		 * @type Raycaster
		 * @private
		 */

		this.raycaster = new Raycaster();

		/**
		 * The cursor size.
		 *
		 * @property cursorSize
		 * @type Number
		 * @private
		 */

		this.cursorSize = 1;

		/**
		 * The cursor.
		 *
		 * @property cursor
		 * @type Mesh
		 */

		this.cursor = new Mesh(
			new SphereBufferGeometry(this.cursorSize, 16, 16),
			new MeshBasicMaterial({
				transparent: true,
				opacity: 0.5,
				color: 0x0096ff,
				fog: false
			})
		);

		/**
		 * An octree helper.
		 *
		 * @property octreeHelper
		 * @type OctreeHelper
		 */

		this.octreeHelper = new OctreeHelper(this.terrain.volume);
		this.octreeHelper.visible = false;

		/**
		 * An chunk helper.
		 *
		 * @property chunkHelper
		 * @type ChunkHelper
		 */

		this.chunkHelper = new ChunkHelper();
		this.chunkHelper.visible = false;

		/**
		 * A delta time.
		 *
		 * @property delta
		 * @type String
		 */

		this.delta = "";

		this.setEnabled(true);

		/*	this.terrain.union(new Sphere({
				origin: [-32, -32, -32],
				radius: 21
			})); */

	}

	/**
	 * Handles events.
	 *
	 * @method handleEvent
	 * @param {Event} event - An event.
	 */

	handleEvent(event) {

		switch(event.type) {

			case "mousemove":
				this.raycast(event);
				break;

			case "mousedown":
				this.handlePointerEvent(event, true);
				break;

			case "mouseup":
				this.handlePointerEvent(event, false);
				break;

			case "contextmenu":
				event.preventDefault();
				break;

			case "modificationend":
				this.handleModification(event);
				break;

		}

	}

	/**
	 * Handles pointer button events.
	 *
	 * @method handlePointerEvent
	 * @private
	 * @param {MouseEvent} event - A mouse event.
	 * @param {Boolean} pressed - Whether the mouse button has been pressed down.
	 */

	handlePointerEvent(event, pressed) {

		event.preventDefault();

		switch(event.button) {

			case Button.MAIN:
				this.handleMain(pressed);
				break;

			case Button.AUXILIARY:
				this.handleAuxiliary(pressed);
				break;

			case Button.SECONDARY:
				this.handleSecondary(pressed);
				break;

		}

	}

	/**
	 * Handles main pointer button events.
	 *
	 * @method handleMain
	 * @private
	 * @param {Boolean} pressed - Whether the mouse button has been pressed down.
	 */

	handleMain(pressed) {

		if(pressed) {

			this.terrain.union(new Sphere({
				origin: this.cursor.position.toArray(),
				radius: this.cursorSize
			}));

		}

	}

	/**
	 * Handles auxiliary pointer button events.
	 *
	 * @method handleAuxiliary
	 * @private
	 * @param {Boolean} pressed - Whether the mouse button has been pressed down.
	 */

	handleAuxiliary(pressed) {

	}

	/**
	 * Handles secondary pointer button events.
	 *
	 * @method handleSecondary
	 * @private
	 * @param {Boolean} pressed - Whether the mouse button has been pressed down.
	 */

	handleSecondary(pressed) {

		if(pressed) {

			this.terrain.subtract(new Sphere({
				origin: this.cursor.position.toArray(),
				radius: this.cursorSize
			}));

		}

	}

	/**
	 * Handles terrain modifications.
	 *
	 * @method handleModification
	 * @private
	 * @param {TerrainEvent} event - A terrain modification event.
	 */

	handleModification(event) {

		if(this.chunkHelper.visible) {

			this.chunkHelper.chunk = event.chunk;
			this.chunkHelper.update(false, true);

		}

		if(this.octreeHelper.visible) {

			this.octreeHelper.update();

		}

	}

	/**
	 * Raycasts the terrain.
	 *
	 * @method raycast
	 * @param {MouseEvent} event - A mouse event.
	 */

	raycast(event) {

		const raycaster = this.raycaster;
		const t0 = performance.now();

		MOUSE.x = (event.clientX / window.innerWidth) * 2 - 1;
		MOUSE.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(MOUSE, this.camera);
		const intersects = this.terrain.raycast(raycaster);

		this.delta = (performance.now() - t0).toFixed(2) + " ms";

		if(intersects.length > 0) {

			this.cursor.position.copy(intersects[0].point);

		} else {

			this.cursor.position.copy(raycaster.ray.direction).multiplyScalar(10).add(raycaster.ray.origin);

		}

	}

	/**
	 * Enables or disables this editor.
	 *
	 * @method setEnabled
	 * @param {Boolean} enabled - Whether this editor should be enabled or disabled.
	 */

	setEnabled(enabled) {

		const terrain = this.terrain;
		const dom = this.dom;

		if(enabled) {

			this.cursor.position.copy(this.camera.position);
			this.cursor.visible = true;

			terrain.addEventListener("modificationend", this);
			dom.addEventListener("contextmenu", this);
			dom.addEventListener("mousemove", this);
			dom.addEventListener("mousedown", this);
			dom.addEventListener("mouseup", this);

		} else {

			this.cursor.visible = false;

			terrain.removeEventListener("modificationend", this);
			dom.removeEventListener("contextmenu", this);
			dom.removeEventListener("mousemove", this);
			dom.removeEventListener("mousedown", this);
			dom.removeEventListener("mouseup", this);

		}

	}

	/**
	 * Removes all event listeners.
	 *
	 * @method dispose
	 */

	dispose() { this.setEnabled(false); }

	/**
	 * Saves memory usage information about the current volume data.
	 *
	 * @method logMemory
	 */

	logMemory() {

		const a = document.createElement("a");
		const chunks = this.terrain.volume.getChunks();

		const n = this.terrain.volume.resolution;
		const m = Math.pow((n + 1), 3);
		const c = 3 * Math.pow((n + 1), 2) * n;

		let materialReport = "";
		let edgeReport = "";

		let maxMaterials = 0;
		let maxEdges = 0;

		let chunkCount = 0;

		let materialCount = 0;
		let runLengthCount = 0;
		let edgeCount = 0;

		let data, edgeData, edges;
		let i, j, l;

		for(i = 0, j = 0, l = chunks.length; i < l; ++i) {

			data = chunks[i].data;

			if(data !== null) {

				edgeData = data.edgeData;

				edges = (
					edgeData.edges[0].length +
					edgeData.edges[1].length +
					edgeData.edges[2].length
				);

				materialReport += j + ", " + (data.materials + data.runLengths.length * 4) + "\n";
				edgeReport += j + ", " + edges + "\n";

				materialCount += data.materials;
				runLengthCount += data.runLengths.length;
				edgeCount += edges;

				++chunkCount;
				++j;

			}

		}

		maxMaterials = chunkCount * m;
		maxEdges = chunkCount * c;

		let report = "Volume Chunks: " + chunkCount + "\n\n";

		report += "Total Materials: " + materialCount + " (" + maxMaterials + " max)\n";
		report += "Total Run-Lengths: " + runLengthCount + "\n";
		report += "Compression ratio: " + (((materialCount + runLengthCount * 4) / maxMaterials) * 100).toFixed(2) + "%\n";
		report += "Estimated Memory Usage: " + ((materialCount * 8 + runLengthCount * 32) / 8 / 1024 / 1024).toFixed(2) + " MB\n";

		report += "\n";

		report += "Total Edges: " + edgeCount + " (" + maxEdges + " max)\n";
		report += "Compression ratio: " + ((edgeCount / maxEdges) * 100).toFixed(2) + "%\n";
		report += "Estimated Memory Usage: " + ((edgeCount * 32 + edgeCount * 32 + 3 * edgeCount * 32) / 8 / 1024 / 1024).toFixed(2) + " MB\n";

		report += "\n";

		report += "Material Counts\n\n";
		report += materialReport;

		report += "\n";

		report += "Edge Counts\n\n";
		report += edgeReport + "\n";

		a.href = URL.createObjectURL(new Blob([report], {
			type: "text/plain"
		}));

		a.download = "memory.txt";
		a.click();

	}

	/**
	 * Saves a snapshot of the current terrain data.
	 *
	 * @method save
	 */

	save() {

		const a = document.createElement("a");
		a.href = this.terrain.save();
		a.download = "terrain.json";
		a.click();

	}

	/**
	 * Registers configuration options.
	 *
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const folder = gui.addFolder("Editor");

		const params = {
			hermiteData: this.chunkHelper.visible,
			octree: this.octreeHelper.visible
		};

		folder.add(this, "delta").listen();

		folder.add(this, "cursorSize").min(0.5).max(6).step(0.01).onChange(() => {

			this.cursor.scale.set(this.cursorSize, this.cursorSize, this.cursorSize);

		});

		folder.add(params, "hermiteData").onChange(() => {

			this.chunkHelper.dispose();
			this.chunkHelper.visible = params.hermiteData;

		});

		folder.add(params, "octree").onChange(() => {

			this.octreeHelper.update();
			this.octreeHelper.visible = params.octree;

		});

		folder.add(this, "logMemory");
		folder.add(this, "save");

	}

}
