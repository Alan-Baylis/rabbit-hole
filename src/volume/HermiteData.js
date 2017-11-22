import { RunLengthEncoding } from "../compression/RunLengthEncoding.js";
import { EdgeData } from "./EdgeData.js";
import { Material } from "./Material.js";

/**
 * The material grid resolution.
 *
 * @type {Number}
 * @private
 * @default 0
 */

let resolution = 0;

/**
 * The total amount of grid point indices.
 *
 * @type {Number}
 * @private
 * @default 0
 */

let indexCount = 0;

/**
 * Rounds the given number up to the next power of two.
 *
 * @private
 * @param {Number} n - A number.
 * @return {Number} The next power of two.
 */

function ceil2(n) {

	return Math.pow(2, Math.max(0, Math.ceil(Math.log2(n))));

}

/**
 * Hermite data.
 *
 * @implements {Serializable}
 * @implements {Deserializable}
 * @implements {TransferableContainer}
 */

export class HermiteData {

	/**
	 * Constructs a new set of Hermite data.
	 *
	 * @param {Boolean} [initialise=true] - Whether the data should be initialised immediately.
	 */

	constructor(initialise = true) {

		/**
		 * The level of detail.
		 *
		 * @type {Number}
		 * @default -1
		 */

		this.lod = -1;

		/**
		 * Indicates whether this data is currently gone.
		 *
		 * @type {Boolean}
		 * @default false
		 */

		this.neutered = false;

		/**
		 * Describes how many material indices are currently solid:
		 *
		 * - The chunk lies outside the volume if there are no solid grid points.
		 * - The chunk lies completely inside the volume if all points are solid.
		 *
		 * @type {Number}
		 * @default 0
		 */

		this.materials = 0;

		/**
		 * The grid points.
		 *
		 * @type {Uint8Array}
		 */

		this.materialIndices = initialise ? new Uint8Array(indexCount) : null;

		/**
		 * Run-length compression data.
		 *
		 * @type {Uint32Array}
		 * @default null
		 */

		this.runLengths = null;

		/**
		 * The edge data.
		 *
		 * @type {EdgeData}
		 * @default null
		 */

		this.edgeData = null;

	}

	/**
	 * Indicates whether this data container is empty.
	 *
	 * @type {Boolean}
	 */

	get empty() {

		return (this.materials === 0);

	}

	/**
	 * Indicates whether this data container is full.
	 *
	 * @type {Boolean}
	 */

	get full() {

		return (this.materials === indexCount);

	}

	/**
	 * Indicates whether this data is currently compressed.
	 *
	 * @type {Boolean}
	 */

	get compressed() {

		return (this.runLengths !== null);

	}

	/**
	 * Adopts the given data.
	 *
	 * @param {HermiteData} data - The data to adopt.
	 * @return {HermiteData} This data.
	 */

	set(data) {

		this.lod = data.lod;
		this.neutered = data.neutered;
		this.materials = data.materials;
		this.materialIndices = data.materialIndices;
		this.runLengths = data.runLengths;
		this.edgeData = data.edgeData;

		return this;

	}

	/**
	 * Removes all data.
	 *
	 * @return {HermiteData} This data.
	 */

	clear() {

		this.lod = -1;
		this.neutered = false;
		this.materials = 0;
		this.materialIndices = null;
		this.runLengths = null;
		this.edgeData = null;

		return this;

	}

	/**
	 * Sets the specified material index.
	 *
	 * @param {Number} index - The index of the material index that should be updated.
	 * @param {Number} value - The new material index.
	 */

	setMaterialIndex(index, value) {

		// Keep track of how many material indices are solid.
		if(this.materialIndices[index] === Material.AIR) {

			if(value !== Material.AIR) {

				++this.materials;

			}

		} else if(value === Material.AIR) {

			--this.materials;

		}

		this.materialIndices[index] = value;

	}

	/**
	 * Compresses this data.
	 *
	 * @param {HermiteData} [target=this] - An optional target data set. If none is provided, the original data will be replaced with the compressed data.
	 * @return {HermiteData} The target data set.
	 */

	compress(target = this) {

		let encoding;

		if(!this.compressed) {

			// Note: empty sets won't be compressed. They can be discarded.
			if(this.full) {

				// This deliberately destroys material variations to save space!
				encoding = new RunLengthEncoding(
					[this.materialIndices.length],
					[Material.SOLID]
				);

			} else {

				encoding = RunLengthEncoding.encode(this.materialIndices);

			}

			target.runLengths = new Uint32Array(encoding.runLengths);
			target.materialIndices = new Uint8Array(encoding.data);

		}

		return target;

	}

	/**
	 * Decompresses this data.
	 *
	 * @param {HermiteData} [target=this] - An optional target data set. If none is provided, the compressed data will be replaced with the decompressed data.
	 * @return {HermiteData} The target data set.
	 */

	decompress(target = this) {

		target.materialIndices = !this.compressed ?
			this.materialIndices : RunLengthEncoding.decode(
				this.runLengths, this.materialIndices, new Uint8Array(indexCount)
			);

		target.runLengths = null;

		return target;

	}

	/**
	 * Serialises this data.
	 *
	 * @return {Object} The serialised data.
	 */

	serialize() {

		this.neutered = true;

		return {
			lod: this.lod,
			materials: this.materials,
			materialIndices: this.materialIndices,
			runLengths: this.runLengths,
			edgeData: (this.edgeData !== null) ? this.edgeData.serialize() : null
		};

	}

	/**
	 * Adopts the given serialised data.
	 *
	 * @param {Object} object - Serialised Hermite data. Can be null.
	 * @return {Deserializable} This object or null if the given serialised data was null.
	 */

	deserialize(object) {

		let result = this;

		if(object !== null) {

			this.lod = object.lod;
			this.materials = object.materials;

			this.materialIndices = object.materialIndices;
			this.runLengths = object.runLengths;

			if(object.edgeData !== null) {

				if(this.edgeData === null) {

					// Create an empty edge data container.
					this.edgeData = new EdgeData();

				}

				this.edgeData.deserialize(object.edgeData);

			} else {

				this.edgeData = null;

			}

			this.neutered = false;

		} else {

			result = null;

		}

		return result;

	}

	/**
	 * Creates a list of transferable items.
	 *
	 * @param {Array} [transferList] - An optional target list. The transferable items will be added to this list.
	 * @return {Transferable[]} The transfer list.
	 */

	createTransferList(transferList = []) {

		if(this.edgeData !== null) {

			this.edgeData.createTransferList(transferList);

		}

		if(this.materialIndices !== null) {

			transferList.push(this.materialIndices.buffer);

		}

		if(this.runLengths !== null) {

			transferList.push(this.runLengths.buffer);

		}

		return transferList;

	}

	/**
	 * The material grid resolution.
	 *
	 * The effective resolution of a chunk of Hermite data is the distance between
	 * two adjacent grid points with respect to the size of the containing world
	 * octant.
	 *
	 * @type {Number}
	 */

	static get resolution() {

		return resolution;

	}

	/**
	 * This value can only be set once. The upper limit is 256.
	 *
	 * @type {Number}
	 */

	static set resolution(value = 0) {

		if(resolution === 0) {

			resolution = Math.max(1, Math.min(256, ceil2(value)));
			indexCount = Math.pow((resolution + 1), 3);

		}

	}

}
