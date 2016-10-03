import THREE from "three";
import { Action } from "./action.js";
import worker from "./worker.tmp";

/**
 * The worker program.
 *
 * @property WORKER_BLOB
 * @type Blob
 * @private
 * @static
 * @final
 */

const WORKER_BLOB = URL.createObjectURL(new Blob([worker], { type: "text/javascript" }));

/**
 * Manages worker threads.
 *
 * @class ThreadPool
 * @submodule worker
 * @extends EventDispatcher
 * @constructor
 * @param {Number} [maxWorkers] - Limits the amount of active workers. The default limit is the amount of logical processors.
 */

export class ThreadPool extends THREE.EventDispatcher {

	constructor(maxWorkers = navigator.hardwareConcurrency) {

		super();

		/**
		 * The maximum number of active worker threads.
		 *
		 * @property maxWorkers
		 * @type Number
		 * @default navigator.hardwareConcurrency
		 */

		this.maxWorkers = Math.min(navigator.hardwareConcurrency, maxWorkers);

		/**
		 * A list of existing workers.
		 *
		 * @property workers
		 * @type Array
		 * @private
		 */

		this.workers = [];

		/**
		 * Keeps track of workers that are currently busy.
		 *
		 * @property busyWorkers
		 * @type WeakSet
		 * @private
		 */

		this.busyWorkers = new WeakSet();

	}

	/**
	 * Closes a worker.
	 *
	 * @method closeWorker
	 * @param {Worker} The worker to close.
	 */

	closeWorker(worker) {

		const index = this.workers.indexOf(worker);

		if(this.busyWorkers.has(worker)) {

			this.busyWorkers.delete(worker);
			worker.terminate();

		} else {

			worker.postMessage({
				action: Action.CLOSE
			});

		}

		if(index >= 0) {

			this.workers.splice(index, 1);

		}

	}

	/**
	 * Creates a new worker.
	 *
	 * @method createWorker
	 * @private
	 * @return {Worker} The worker.
	 */

	createWorker() {

		const worker = new Worker(WORKER_BLOB);

		this.workers.push(worker);

		worker.addEventListener("message", (event) => {

			const worker = event.target;

			this.busyWorkers.delete(worker);

			this.dispatchEvent(event);

		});

		worker.addEventListener("error", (event) => {

			this.dispatchEvent(event);

		});

		return worker;

	}

	/**
	 * Polls an available worker and returns it. The worker will be excluded from
	 * subsequent polls until it finishes its task and sends a message back.
	 *
	 * @method getWorker
	 * @return {Worker} A worker or null if all resources are currently exhausted.
	 */

	getWorker() {

		let worker = null;

		let i;

		for(i = this.workers.length - 1; i >= 0; --i) {

			if(!this.busyWorkers.has(this.workers[i])) {

				worker = this.workers[i];
				this.busyWorkers.add(worker);

				break;

			}

		}

		if(worker === null && this.workers.length < this.maxWorkers) {

			// All existing workers are busy.
			worker = this.createWorker();
			this.busyWorkers.add(worker);

		}

		return worker;

	}

	/**
	 * Resets this thread pool by closing all workers.
	 *
	 * @method clear
	 */

	clear() {

		while(this.workers.length > 0) {

			this.closeWorker(this.workers.pop());

		}

	}

}
