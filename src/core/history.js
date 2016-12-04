import { OperationType } from "../volume/csg/operation-type.js";

/**
 * An operation history.
 *
 * @class History
 * @submodule core
 * @constructor
 */

export class History {

	constructor() {

		/**
		 * The elements that have been executed during the current session.
		 *
		 * @property elements
		 * @type Array
		 * @private
		 */

		this.elements = [];

	}

	/**
	 * Adds an SDF to the operation history.
	 *
	 * @method push
	 * @param {SignedDistanceFunction} sdf - An SDF.
	 * @return {Number} The new length of the history list.
	 */

	push(sdf) {

		return this.elements.push(sdf);

	}

	/**
	 * Removes the SDF that was last added to the history and returns it.
	 *
	 * @method pop
	 * @return {SignedDistanceFunction} An SDF.
	 */

	pop() {

		return this.elements.pop();

	}

	/**
	 * Combines all operations into one.
	 *
	 * @method combine
	 * @return {SignedDistanceFunction} An SDF consisting of all past operations, or null if there are none.
	 */

	combine() {

		const elements = this.elements;

		let a = null;
		let b = null;

		let i, l;

		if(elements.length > 0) {

			for(i = 0, l = elements.length; i < l; ++i) {

				b = elements[i];

				if(a !== null) {

					switch(b.operation) {

						case OperationType.UNION:
							a.union(b);
							break;

						case OperationType.DIFFERENCE:
							a.subtract(b);
							break;

						case OperationType.INTERSECTION:
							a.intersect(b);
							break;

					}

				} else {

					a = b;

				}

			}

		}

		return a;

	}

	/**
	 * Clears this history.
	 *
	 * @method clear
	 */

	clear() {

		this.elements = [];

	}

}
