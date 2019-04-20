import java.util.Date;

public class ThreadJava {

	public static void main (String[] args) {
		try {
			Runnable runnable = new Runnable() {
				int num = Integer.parseInt(args[0]);
				long startAt = new Date().getTime();

				@Override
				public void run() {
					Prime prime = new Prime(num);
					int count = prime.count();
					long times = new Date().getTime() - startAt;
					System.out.println(
						String.format("Java thread id #%d: executes %d prime numbers in %d ms", 
							Thread.currentThread().getId(),
							count,
							times));
				}
			};

			Thread t0 = new Thread(runnable);
			Thread t1 = new Thread(runnable);
			Thread t2 = new Thread(runnable);
			Thread t3 = new Thread(runnable);
			
			t0.start();
			t1.start();
			t2.start();
			t3.start();

			try {
				t0.join();
				t1.join();
				t2.join();
				t3.join();
			} catch(InterruptedException e) {}

			System.out.println("Java Threads - initializing complete");
		} catch (Exception e) {
			System.out.println("Invalid argument");
		}
	}
}
