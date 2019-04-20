#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#include <sys/time.h>

struct Arguments
{
    int id;
    int num;
};

int isPrime(int n) {
    if (n%2 == 0) return 0;
    for(int i=3; i*i<=n; i+=2) {
        if (n%i == 0) {
            return 0;
        }
    }

    return 1;
}

int count(int num) {
    int found = 0;
    int v = 0;
    while (found < num) {
        found += isPrime(v);
        v++;
    }

    return found;
}

int Prime(int num) {
    return count(num);
}

void *runnable(void *args) {
    struct timeval startAt, endAt;
    double mil = 0;
    gettimeofday(&startAt, NULL);
    struct Arguments *argv = args;
    int _count = Prime(argv->num);
    gettimeofday(&endAt, NULL);

    if (startAt.tv_usec <= endAt.tv_usec) {
        mil = (double)(endAt.tv_usec - startAt.tv_usec) / 1000;
    } else {
        mil = (double)endAt.tv_usec / 1000;
    }

    int id = argv->id;
    if (id < 1) {
        id = id * -1;
    }

    printf("C thread id #%d: executes %d prime numbers in %.0f ms\n", 
        id, _count, mil);

    return NULL;
}

int main(int argc, char **argv) {

    int num = atoi(argv[1]);

    pthread_t t0, t1, t2, t3;
    struct Arguments args0, args1, args2, args3;
    args0.id = (intptr_t)&t0;
    args0.num = num;

    args1.id = (intptr_t)&t1;
    args1.num = num;

    args2.id = (intptr_t)&t2;
    args2.num = num;

    args3.id = (intptr_t)&t3;
    args3.num = num;
    
    printf("C Threads - initializing complete\n");

    pthread_create(&t0, NULL, runnable, (void *)&args0);
    pthread_create(&t1, NULL, runnable, (void *)&args1);
    pthread_create(&t2, NULL, runnable, (void *)&args2);
    pthread_create(&t3, NULL, runnable, (void *)&args3);

    pthread_join(t0, NULL);
    pthread_join(t1, NULL);
    pthread_join(t2, NULL);
    pthread_join(t3, NULL);

    return 0;
}