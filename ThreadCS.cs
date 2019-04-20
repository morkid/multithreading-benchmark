using System;
using System.Threading;

namespace ThreadCS {

    class ThreadCS {
        static void Main(string[] args)
        {
            int num = 0;
            try {
                num = Int32.Parse(args[1]);
            } catch (Exception e) {
                Console.WriteLine("Invalid argument: {0}", e.Message);
                return;
            }

            Runnable runnable = new Runnable(num);
            Thread t0 = new Thread(new ThreadStart(runnable.run));
            Thread t1 = new Thread(new ThreadStart(runnable.run));
            Thread t2 = new Thread(new ThreadStart(runnable.run));
            Thread t3 = new Thread(new ThreadStart(runnable.run));

            Console.WriteLine("C# Threads - initializing complete");

            t0.Start();
            t1.Start();
            t2.Start();
            t3.Start();

            try {
                t0.Join();
                t1.Join();
                t2.Join();
                t3.Join();
            } catch (Exception e) {
                Console.WriteLine("Join failed: {0}", e.Message);
            }
        }
    }

    class Runnable {
        private int num;
        private long startAt;
        public Runnable(int num) {
            this.num = num;
            this.startAt = DateTimeOffset.Now.ToUnixTimeMilliseconds();
        }

        public void run() {
            Prime prime = new Prime(this.num);
            int count = prime.count();
            long endAt = DateTimeOffset.Now.ToUnixTimeMilliseconds() - this.startAt;
            Console.WriteLine("C# thread id #{0}: executes {1} prime numbers in {2} ms",
                Thread.CurrentThread.ManagedThreadId, 
                count, 
                endAt);
        }
    }
}
