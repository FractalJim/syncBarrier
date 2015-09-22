# syncBarrier
Node module for creating a synchronisation barrier that waits for several async function calls to complete before running another function.

Version 2 (breaking change) introduces a new second argument to the constructor and registration functions to specify the object that should be used as this when executing these functions.  

There are three steps to using syncBarrier :

1. Create a new barrier object and pass it the function you want to run on completion (the onComplete function), a reference to be used for "this" while running the function (can be null)  and any arguments that function needs.

2. For each function you want to finish running before the onComplete function is called  call "registerFunction" on the barrier passing argumetns in the same manner as to the constructor.  A completion callback must be the final argument in the argument list of the function you are registering. You should not pass this callback yourself as the barrier will pass a callback of its own. The function you register will be called with the arguments you pass "registerFunction" as soon as you register it.

3. Once you have registered all the functions you want to wait for, call "startWaitComplete" on the barrier object. The onComplete function will then run as soon as all the registered functions have finished running.

## Example
This example (taken from the test code) uses two barriers.  It will print the output from the barrier2 functions followed by the output
from the barrier1  functions (as the functions used with barrier2 are actually synchronous, so get executed immediately).
Notice that  the final argument to the test functions is a callback.  
```JavaScript
var syncBarrier = require('syncbarrier')

//Should see output like
/*
3
4
Barrier 2 Complete
1
2
Barrier 1 Complete
*/
test()

function test ()
{
        var barrier = new syncBarrier.Barrier(console.log,null,"Barrier 1 Complete");
        barrier.registerFunction(testFunction,null,1);
        barrier.registerFunction(testFunction,null,2);
        barrier.startWaitComplete();

        //Inline function calls
        var barrier2 = new syncBarrier.Barrier(console.log,null,"Barrier 2 Complete");
        barrier2.registerFunction(testFunctionSync,null,3);
        barrier2.registerFunction(testFunctionSync,null,4);
        barrier2.startWaitComplete();
}

function testFunction(num,end)
{
  setTimeout(testFunctionSync,10,num,end);
}

function testFunctionSync(num,end)
{
  console.log(num);
  end();
}

```
