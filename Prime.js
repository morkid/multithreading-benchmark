class Prime {
	constructor(num) {
		this.num = num;
	}

	count() {
		let found = 0;
		let v = 0;
		while (found < this.num) {
			found += this.isPrime(v);
			v++;
		}

		return found;
	}

	isPrime(n) {
		if (n%2 == 0) return 0;
		for(let i=3; i*i<=n; i+=2) {
			if (n%i == 0) {
				return 0;
			}
		}

		return 1;
	}
}

module.exports = Prime;