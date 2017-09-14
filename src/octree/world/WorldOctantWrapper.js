import { Vector3 } from "math-ds";

/**
 * A world octant wrapper that stores positional information.
 */

export class WorldOctantWrapper {

	/**
	 * Constructs a new octant wrapper.
	 *
	 * @param {WorldOctant} [octant=null] - An octant.
	 */

	constructor(octant = null) {

		/**
		 * The world octant.
		 *
		 * @type {WorldOctant}
		 * @default null
		 */

		this.octant = octant;

		/**
		 * The lower bounds of the world octant.
		 *
		 * @type {Vector3}
		 * @default new Vector3()
		 */

		this.min = new Vector3();

		/**
		 * The upper bound of the world octant.
		 *
		 * @type {Vector3}
		 * @default new Vector3()
		 */

		this.max = new Vector3();

	}

}
