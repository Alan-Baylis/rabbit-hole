import { Box3, Vector3 } from "../../math";
import { SignedDistanceFunction } from "./signed-distance-function.js";
import { SDFType } from "./sdf-type.js";

/**
 * A Signed Distance Function that describes a sphere.
 *
 * @class Sphere
 * @submodule sdf
 * @extends SignedDistanceFunction
 * @constructor
 * @param {Object} parameters - The parameters.
 * @param {Array} parameters.origin - The origin [x, y, z].
 * @param {Number} parameters.radius - The radius.
 * @param {Number} [material] - A material index.
 */

export class Sphere extends SignedDistanceFunction {

	constructor(parameters = {}, material) {

		super(SDFType.SPHERE, material);

		/**
		 * The origin.
		 *
		 * @property origin
		 * @type Vector3
		 * @private
		 */

		this.origin = new Vector3(...parameters.origin);

		/**
		 * The radius.
		 *
		 * @property radius
		 * @type Number
		 * @private
		 */

		this.radius = parameters.radius;

	}

	/**
	 * Calculates the bounding box of this density field.
	 *
	 * @method computeBoundingBox
	 * @return {Box3} The bounding box.
	 */

	computeBoundingBox() {

		const min = this.origin.subScalar(this.radius);
		const max = this.origin.addScalar(this.radius);

		this.bbox = new Box3();

		this.bbox.min.set(min, min, min);
		this.bbox.max.set(max, max, max);

		return this.bbox;

	}

	/**
	 * Samples the volume's density at the given point in space.
	 *
	 * @method sample
	 * @param {Vector3} position - A position.
	 * @return {Number} The euclidean distance to the surface.
	 */

	sample(position) {

		const origin = this.origin;

		const dx = position.x - origin.x;
		const dy = position.y - origin.y;
		const dz = position.z - origin.z;

		const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

		return length - this.radius;

	}

	/**
	 * Serialises this SDF.
	 *
	 * @method serialise
	 * @return {Object} A concise representation of this SDF.
	 */

	serialise() {

		const result = super.serialise();

		result.parameters = {
			origin: this.origin.toArray(),
			radius: this.radius
		};

		return result;

	}

}
