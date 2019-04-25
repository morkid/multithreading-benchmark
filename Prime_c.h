#ifndef PRIME_C_H
#define PRIME_C_H

struct Prime {
    int num;
    int (*count)(struct Prime *this);
    int (*isPrime)(int n);
};

extern const struct PrimeClass {
    struct Prime (*new)(int num);
} Prime;

int isPrime(int n) {
    if (n%2 == 0) return 0;
    for(int i=3; i*i<=n; i+=2) {
        if (n%i == 0) {
            return 0;
        }
    }

    return 1;
}

static int count(struct Prime *this) {
    int found = 0;
    int v = 0;
    while (found < this->num) {
        found += isPrime(v++);
    }

    return found;
}

static struct Prime new(int num) {
    return (struct Prime){
        .num=num, 
        .count=&count, 
        .isPrime=&isPrime
    };
}

const struct PrimeClass Prime={.new=&new};

struct Runnable {
	void (*run)();
};

static struct Runnable _new(void *run) {
    return (struct Runnable){
        .run=run
    };
}

extern const struct RunnableClass {
    struct Runnable (*new)(void *run);
} Runnable;

const struct RunnableClass Runnable={.new=&_new};

#endif