#ifndef THREAD_C_H
#define THREAD_C_H

#include <pthread.h>
#include <Prime_c.h>

struct Thread {
	pthread_t t;
	Runnable runnable;
	void (*start)(struct Thread *this);
	void (*join)(struct Thread *this);
};

extern const struct ThreadClass {
    struct Thread (*new)(pthread_t t, Runnable runnable);
} Thread;

static struct Thread thread_new(pthread_t t, Runnable runnable) {
    return (struct Thread){
        .t=t, 
        .runnable=runnable
    };
}

static void _start(struct Thread *this) {
	
}

static void _join(struct Thread *this) {
	
}

const struct ThreadClass Thread={.new=&thread_new, .start=&_start, .join=&_join};

#endif