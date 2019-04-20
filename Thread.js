const { Worker, isMainThread, threadId, parentPort, workerData } = require('worker_threads');

class Thread {
	constructor(argv) {
		try {
			this.argv = argv;
			this.argv.run = argv.run.toString();
		} catch (e) {
			throw e;
		}

		if (!this.argv.num) {
			throw new Error("Invalid argument");
		}
	}

	start() {
		if (isMainThread) {
			return this.run = new Promise((resolve, reject) => {
				const worker = new Worker(__filename, {
					workerData: {...this.argv}
				});

				worker.on("message", resolve);
	            worker.on("error", reject);
	            worker.on("exit", code => {
	                if (code !== 0) {
	                    reject(new Error("worker stopped with exit code "+code));
	                }
	            });
			});
		} else {
			function Runnable() {}
			Runnable.prototype = this.argv;
			Runnable.prototype._run = function() {
				return eval(workerData.run).call(this);
			};
			var runnable = new Runnable();
			runnable._run.call(runnable);
		}
	}
}

if (!isMainThread) {
	new Thread(workerData).start();
}

module.exports = Thread;