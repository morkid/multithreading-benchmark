const Thread = require("./Thread");

class ThreadJavaScript {

    main(argv) {
        try {
            const runnable = {
                num: parseInt(argv[2]),
                startAt: new Date().getTime(),

                run: () => {
                    const Prime = require("./Prime");
                    const prime = new Prime(this.num);
                    const count = prime.count();
                    const times = new Date().getTime() - this.startAt;
                    console.log(
                        `JavaScript thread id #${threadId}: executes ${count} prime numbers in ${times} ms`);
                }
            };

            const t0 = new Thread(runnable);
            const t1 = new Thread(runnable);
            const t2 = new Thread(runnable);
            const t3 = new Thread(runnable);

            t0.start();
            t1.start();
            t2.start();
            t3.start();

            t0.run.then(console.log).catch(console.error);
            t1.run.then(console.log).catch(console.error);

            process.stdout.write("JavaScript Threads - initializing complete\n");
        } catch (e) {
            process.stdout.write("Invalid argument\n")
        }
    }
}

new ThreadJavaScript().main(process.argv);
