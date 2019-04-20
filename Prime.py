class Prime:
    def __init__(self, num):
        self.num = num

    def count(self):
        found = 0
        v = 0
        while found < self.num:
            found += self.isPrime(v)
            v += 1

        return found

    def isPrime(self, n):
        if n%2 == 0:
            return 0

        i = 3
        while i*i <= n:
            i+=2
            if n%i == 0:
                return 0

        return 1