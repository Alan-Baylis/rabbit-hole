import { Material } from "../material.js";
import { Operation } from "./operation.js";
import { OperationType } from "./operation-type.js";

/**
 * The isovalue.
 *
 * @type {Number}
 * @private
 */

const ISOVALUE = 0.0;

/**
 * An operation that describes a density field.
 */

export class DensityFunction extends Operation {

	/**
	 * Constructs a new density function operation.
	 *
	 * @param {SignedDistanceFunction} sdf - An SDF.
	 */

	constructor(sdf) {

		super(OperationType.DENSITY_FUNCTION);

		/**
		 * An SDF.
		 *
		 * @type {SignedDistanceFunction}
		 * @private
		 */

		this.sdf = sdf;

	}

	/**
	 * Calculates a bounding box for this operation.
	 *
	 * @return {Box3} The bounding box.
	 */

	computeBoundingBox() {

		this.bbox = this.sdf.computeBoundingBox();

		return this.bbox;

	}

	/**
	 * Calculates the material index for the given world position.
	 *
	 * @param {Vector3} position - The world position of the material index.
	 * @return {Number} The material index.
	 */

	generateMaterialIndex(position) {

		return (this.sdf.sample(position) <= ISOVALUE) ? this.sdf.material : Material.AIR;

	}

	/**
	 * Generates surface intersection data for the specified edge.
	 *
	 * @param {Edge} edge - The edge that should be processed.
	 */

	generateEdge(edge) {

		edge.approximateZeroCrossing(this.sdf);
		edge.computeSurfaceNormal(this.sdf);

	}

}
