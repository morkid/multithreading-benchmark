<?php

class Prime {
	private $num;

	public function __construct(int $num) {
		$this->num = $num;
	}

	public function count() {
		$found = 0;
		$v = 0;
		while ($found < $this->num) {
			$found += $this->isPrime($v);
			$v++;
		}

		return $found;
	}

	private function isPrime(int $n) {
		if ($n%2 == 0) return 0;
		for($i=3; $i*$i<=$n; $i+=2) {
			if ($n%$i == 0) {
				return 0;
			}
		}

		return 1;
	}
}
