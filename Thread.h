#ifndef CPP_THREAD_H
#define CPP_THREAD_H

#include <thread>
#include <iostream>

using namespace std;

class Runnable {
    public: virtual void run() 
    {}
};

class Thread {
    public:
        Runnable* runnable;
        Thread(Runnable* runnable) {
            this->runnable = runnable;
        }

        void join() {
            thread t(&Runnable::run, this->runnable);
            t.join();
        }
};

#endif