<?php
require('Prime.php');

if (!class_exists('Thread')) {
    print("Please enable pthreads extension. More info: https://www.php.net/manual/en/pthreads.installation.php");
    exit(1);
}

interface Runnable { public function run();}

class RunnableThread extends Thread implements Runnable {
    private $num;
    private $startAt;
    public function __construct(int $num) {
        $this->num = $num;
        $this->startAt = microtime(true);
    }

    public function run() {
        $prime = new Prime($this->num);
        $count = $prime->count();
        $endAt = (microtime(true) - $this->startAt) * 1000;
        printf("PHP thread id #%d: executes %d prime numbers in %d ms\n",
            Thread::getCurrentThreadId(),
            $count, $endAt);
    }
}

function main(array $args) {
    if (php_sapi_name() !='cli' || !isset($args[1])) {
        print("Invalid argument".PHP_EOL);
        exit(1);
    }

    $num = intval($args[1]);

    print("PHP Threads - initializing complete\n");

    $t0 = new RunnableThread($num);
    $t1 = new RunnableThread($num);
    $t2 = new RunnableThread($num);
    $t3 = new RunnableThread($num);

    $t0->start();
    $t1->start();
    $t2->start();
    $t3->start();


    try {
        $t0->join();
        $t1->join();
        $t2->join();
        $t3->join();
    } catch (Exception $e) {}
}

main($argv);
