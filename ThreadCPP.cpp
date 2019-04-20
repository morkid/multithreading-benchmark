#include <Thread.h>
#include <Prime.h>
#include <iostream>
#include <chrono>
#include <sstream>

using namespace std;
using namespace std::chrono;

int main(int argc, char** argv) {
    int n = stoi(argv[1]);
/*
    try {
        n = stoi(argv[1]);
    } catch (exception& e) {
        cout << "Invalid argument" << endl;
        return 1;
    }*/

    class constructor : public Runnable {
        private:
            int num;
            time_point<system_clock> startAt, endAt;

            double threadId() {
                stringstream ss;
                ss << this_thread::get_id();
                return stod(ss.str());
            };

        public:
            constructor(int n) {
                this->num = n;
                this->startAt = system_clock::now();
            };

            virtual void run() override {
                Prime* prime = new Prime(this->num);
                int count = prime->count();
                duration<double> endAt = system_clock::now() - this->startAt;
                printf("C++ thread id #%.f: executes %d prime numbers in %.f ms\n",
                    threadId(), count, endAt.count() * 1000);
            }
    } runnable (n);

    // Thread t0 = Thread(&runnable);
    // Thread t1 = Thread(&runnable);
    // Thread t2 = Thread(&runnable);
    // Thread t3 = Thread(&runnable);
    cout << "C++ Threads - initializing complete" << endl;
    
    thread t0(&Runnable::run, &runnable);
    thread t1(&Runnable::run, &runnable);
    thread t2(&Runnable::run, &runnable);
    thread t3(&Runnable::run, &runnable);
    
    t0.join();
    t1.join();
    t2.join();
    t3.join();

    return 0;
}