import { Octree, PATTERN } from "sparse-octree";
import { Vector3, QEFData, QEFSolver } from "../../math";
import { Edge, Density, Voxel, EDGES } from "../";
import { VoxelCell } from "./voxel-cell.js";

/**
 * Creates a voxel and builds a material configuration code from the materials
 * in the voxel corners.
 *
 * @method createVoxel
 * @private
 * @static
 * @param {Number} n - The grid resolution.
 * @param {Number} x - A local grid point X-coordinate.
 * @param {Number} y - A local grid point Y-coordinate.
 * @param {Number} z - A local grid point Z-coordinate.
 * @param {Uint8Array} materialIndices - The material indices.
 * @return {Voxel} A voxel.
 */

function createVoxel(n, x, y, z, materialIndices) {

	const m = n + 1;
	const mm = m * m;

	const voxel = new Voxel();

	let materials, edgeCount;
	let material, offset, index;
	let c1, c2, m1, m2;

	let i;

	// Pack the material information of the eight corners into a single byte.
	for(materials = 0, i = 0; i < 8; ++i) {

		// Translate the coordinates into a one-dimensional grid point index.
		offset = PATTERN[i];
		index = (z + offset[2]) * mm + (y + offset[1]) * m + (x + offset[0]);

		// Convert the identified material index into a binary value.
		material = Math.min(materialIndices[index], Density.SOLID);

		// Store the value in bit i.
		materials |= (material << i);

	}

	// Find out how many edges intersect with the implicit surface.
	for(edgeCount = 0, i = 0; i < 12; ++i) {

		c1 = EDGES[i][0];
		c2 = EDGES[i][1];

		m1 = (materials >> c1) & 1;
		m2 = (materials >> c2) & 1;

		// Check if there is a material change on the edge.
		if(m1 !== m2) {

			++edgeCount;

		}

	}

	voxel.materials = materials;
	voxel.edgeCount = edgeCount;
	voxel.qefData = new QEFData();

	return voxel;

}

/**
 * A cubic voxel octree.
 *
 * @class VoxelBlock
 * @submodule octree
 * @extends Octree
 * @constructor
 * @param {Chunk} chunk - A volume chunk.
 */

export class VoxelBlock extends Octree {

	constructor(chunk) {

		super();

		this.root = new VoxelCell(chunk.min, chunk.size);

		/**
		 * The amount of voxels in this block.
		 *
		 * @property voxelCount
		 * @type Number
		 */

		this.voxelCount = 0;

		this.construct(chunk);

	}

	/**
	 * Attempts to simplify the octree by clustering voxels.
	 *
	 * @method simplify
	 * @param {Number} threshold - A QEF error threshold.
	 */

	simplify(threshold) {

		this.voxelCount -= this.root.collapse(threshold);

	}

	/**
	 * Creates intermediate voxel cells down to the leaf octant that is described
	 * by the given local grid coordinates and returns it.
	 *
	 * @method getCell
	 * @private
	 * @param {Number} n - The grid resolution.
	 * @param {Number} x - A local grid point X-coordinate.
	 * @param {Number} y - A local grid point Y-coordinate.
	 * @param {Number} z - A local grid point Z-coordinate.
	 * @return {VoxelCell} A leaf voxel cell.
	 */

	getCell(n, x, y, z) {

		let cell = this.root;
		let yz, xz, xy;
		let octant;

		for(n = n >> 1; n > 0; n >>= 1) {

			// Identify the next octant by the grid coordinates.
			yz = (x < n) ? 0 : 1;
			xz = (y < n) ? 0 : 1;
			xy = (z < n) ? 0 : 1;

			octant = (yz << 2) + (xz << 1) + xy;

			if(cell.children === null) {

				cell.split();

			}

			cell = cell.children[octant];

		}

		return cell;

	}

	/**
	 * Constructs voxel cells from volume data.
	 *
	 * @method construct
	 * @private
	 * @param {Chunk} chunk - A volume chunk.
	 */

	construct(chunk) {

		const s = chunk.size;
		const n = chunk.resolution;
		const m = n + 1;
		const mm = m * m;

		const data = chunk.data;
		const edgeData = data.edgeData;
		const materialIndices = data.materialIndices;

		const qefSolver = new QEFSolver();

		const base = this.chunk.min;
		const offsetA = new Vector3();
		const offsetB = new Vector3();
		const intersection = new Vector3();
		const edge = new Edge();

		const sequences = [
			new Uint8Array([0, 1, 2, 3]),
			new Uint8Array([0, 1, 4, 5]),
			new Uint8Array([0, 2, 4, 6])
		];

		let voxelCount = 0;

		let edges, zeroCrossings, normals;
		let sequence, offset;
		let voxel, position;
		let axis, cell;

		let a, d, i, j, l;
		let x, y, z;

		let index;

		for(a = 4, d = 0; d < 3; ++d, a >>= 1) {

			axis = PATTERN[a];

			edges = edgeData.edges[d];
			zeroCrossings = edgeData.zeroCrossings[d];
			normals = edgeData.normals[d];

			sequence = sequences[d];

			for(i = 0, l = edges.length; i < l; ++i) {

				// Each edge is uniquely described by its starting grid point index.
				index = edges[i];

				// Calculate the local grid coordinates from the one-dimensional index.
				x = index % m;
				y = Math.trunc((index % mm) / m);
				z = Math.trunc(index / mm);

				offsetA.set(
					x * s / n,
					y * s / n,
					z * s / n
				);

				offsetB.set(
					(x + axis[0]) * s / n,
					(y + axis[1]) * s / n,
					(z + axis[2]) * s / n
				);

				edge.a.addVectors(base, offsetA);
				edge.b.addVectors(base, offsetB);

				edge.t = zeroCrossings[i];
				edge.n.fromArray(normals, i);

				intersection.copy(edge.computeZeroCrossingPosition());

				// Each edge can belong to up to four voxel cells.
				for(j = 0; j < 4; ++j) {

					// Rotate around the edge.
					offset = PATTERN[sequence[j]];

					x -= offset[0];
					y -= offset[1];
					z -= offset[2];

					// Check if the adjusted coordinates still lie inside the grid bounds.
					if(x >= 0 && y >= 0 && z >= 0 && x < n && y < n && z < n) {

						cell = this.getCell(n, x, y, z);

						if(cell.voxel === null) {

							// The existence of the edge guarantees that the voxel contains the surface.
							cell.voxel = createVoxel(n, x, y, z, materialIndices);

							++voxelCount;

						}

						// Add the edge data to the voxel.
						voxel = cell.voxel;
						voxel.normal.add(edge.n);
						voxel.qefData.add(intersection, edge.n);

						if(voxel.qefData.numPoints === voxel.edgeCount) {

							// Finalise the voxel by solving the accumulated data.
							position = qefSolver.setData(voxel.qefData).solve();

							voxel.position.copy(cell.contains(position) ? position : qefSolver.massPoint);
							voxel.normal.normalize();

						}

					}

				}

			}

		}

		this.voxelCount = voxelCount;

	}

}
