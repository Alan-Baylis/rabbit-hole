/**
 * An edge mask.
 *
 * @type {Uint8Array}
 */

export const edgeMask = new Uint8Array([5, 3, 6]);

/**
 * A face map.
 *
 * @type {Uint8Array[]}
 */

export const faceMap = [

	new Uint8Array([4, 8, 5, 9]),
	new Uint8Array([6, 10, 7, 11]),
	new Uint8Array([0, 8, 1, 10]),
	new Uint8Array([2, 9, 3, 11]),
	new Uint8Array([0, 4, 2, 6]),
	new Uint8Array([1, 5, 3, 7])

];

/**
 * A face mask for cell processing.
 *
 * @type {Uint8Array[]}
 */

export const cellProcFaceMask = [

	new Uint8Array([0, 4, 0]),
	new Uint8Array([1, 5, 0]),
	new Uint8Array([2, 6, 0]),
	new Uint8Array([3, 7, 0]),
	new Uint8Array([0, 2, 1]),
	new Uint8Array([4, 6, 1]),
	new Uint8Array([1, 3, 1]),
	new Uint8Array([5, 7, 1]),
	new Uint8Array([0, 1, 2]),
	new Uint8Array([2, 3, 2]),
	new Uint8Array([4, 5, 2]),
	new Uint8Array([6, 7, 2])

];

/**
 * An edge mask for cell processing.
 *
 * @type {Uint8Array[]}
 */

export const cellProcEdgeMask = [

	new Uint8Array([0, 1, 2, 3, 0]),
	new Uint8Array([4, 5, 6, 7, 0]),
	new Uint8Array([0, 4, 1, 5, 1]),
	new Uint8Array([2, 6, 3, 7, 1]),
	new Uint8Array([0, 2, 4, 6, 2]),
	new Uint8Array([1, 3, 5, 7, 2])

];

/**
 * A face mask for face processing.
 *
 * @type {Array<Uint8Array[]>}
 */

export const faceProcFaceMask = [

	[
		new Uint8Array([4, 0, 0]),
		new Uint8Array([5, 1, 0]),
		new Uint8Array([6, 2, 0]),
		new Uint8Array([7, 3, 0])
	],

	[
		new Uint8Array([2, 0, 1]),
		new Uint8Array([6, 4, 1]),
		new Uint8Array([3, 1, 1]),
		new Uint8Array([7, 5, 1])
	],

	[
		new Uint8Array([1, 0, 2]),
		new Uint8Array([3, 2, 2]),
		new Uint8Array([5, 4, 2]),
		new Uint8Array([7, 6, 2])
	]

];

/**
 * An edge mask for face processing.
 *
 * @type {Array<Uint8Array[]>}
 */

export const faceProcEdgeMask = [

	[
		new Uint8Array([1, 4, 0, 5, 1, 1]),
		new Uint8Array([1, 6, 2, 7, 3, 1]),
		new Uint8Array([0, 4, 6, 0, 2, 2]),
		new Uint8Array([0, 5, 7, 1, 3, 2])
	],

	[
		new Uint8Array([0, 2, 3, 0, 1, 0]),
		new Uint8Array([0, 6, 7, 4, 5, 0]),
		new Uint8Array([1, 2, 0, 6, 4, 2]),
		new Uint8Array([1, 3, 1, 7, 5, 2])
	],

	[
		new Uint8Array([1, 1, 0, 3, 2, 0]),
		new Uint8Array([1, 5, 4, 7, 6, 0]),
		new Uint8Array([0, 1, 5, 0, 4, 1]),
		new Uint8Array([0, 3, 7, 2, 6, 1])
	]

];

/**
 * An edge mask for edge processing.
 *
 * @type {Array<Uint8Array[]>}
 */

export const edgeProcEdgeMask = [

	[
		new Uint8Array([3, 2, 1, 0, 0]),
		new Uint8Array([7, 6, 5, 4, 0])
	],

	[
		new Uint8Array([5, 1, 4, 0, 1]),
		new Uint8Array([7, 3, 6, 2, 1])
	],

	[
		new Uint8Array([6, 4, 2, 0, 2]),
		new Uint8Array([7, 5, 3, 1, 2])
	]

];

/**
 * An edge mask.
 *
 * @type {Uint8Array[]}
 */

export const procEdgeMask = [

	new Uint8Array([3, 2, 1, 0]),
	new Uint8Array([7, 5, 6, 4]),
	new Uint8Array([11, 10, 9, 8])

];
