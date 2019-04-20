from threading import Thread
import sys
import time
from Prime import Prime

class Runnable:
    def __init__(self, threadId):
        self.num = int(sys.argv[1])
        self.startAt = int(round(time.time() * 1000))
        self.threadId = threadId

    def run(self):
        prime = Prime(self.num)
        count = prime.count()
        endAt = int(round(time.time() * 1000)) - self.startAt
        print('Python thread id #%d: executes %d prime numbers in %d ms' % 
            (self.threadId, count, endAt))

def runnable(id):
    Runnable(id).run()

if __name__ == '__main__':

    if len(sys.argv) == 2 and not sys.argv[1]:
        print('Invalid argument')
        exit()
    else:
        if len(sys.argv) < 2:
            print('Invalid argument')
            exit()

    t0 = Thread(target=runnable, args=(1,))
    t1 = Thread(target=runnable, args=(2,))
    t2 = Thread(target=runnable, args=(3,))
    t3 = Thread(target=runnable, args=(4,))

    print('Python Threads - initializing complete')
    
    t0.setDaemon(True)
    t1.setDaemon(True)
    t2.setDaemon(True)
    t3.setDaemon(True)

    t0.start()
    t1.start()
    t2.start()
    t3.start()

    try:
        t0.join()
        t1.join()
        t2.join()
        t3.join()
    except Exception as e:
        print(str(e))

