#ifndef CPP_PRIME_H
#define CPP_PRIME_H

class Prime {
	private: int num;
	public:
		Prime(int num) {
			this->num = num;
		}

		int count() {
			int found = 0;
			int v = 0;
			while (found < this->num) {
				found += this->isPrime(v);
				v++;
			}

			return found;
		}

		int isPrime(int n) {
			if (n%2 == 0) return 0;
			for(int i=3; i*i<=n; i+=2) {
				if (n%i == 0) {
					return 0;
				}
			}

			return 1;
		}
};

#endif