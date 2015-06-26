# syncBarrier
Node module for creating a synchronisation barrier that waits for several async function calls to complete before running another function.

There are three steps to using syncBarrier :

1. Create a new barrier object and pass it the function you want to run on completion (the onComplete function) and any arguments that function needs.

2. For each function you want to finish running before the onComplete function is called  call "registerFunction" on the barrier.  A completion callback must be the final argument in the argument list of the function you are registering. You should not pass this callback yourself as the barrier will pass a callback of its own. The function you register will be called with the arguments you pass "registerFunction" as soon as you register it.

3. Once you have registered all the functions you want to wait for, call "startWaitComplete" on the barrier object. The onComplete function will then run as soon as all the registered functions have finished running.

## Example
This example (taken from the test code) use two barriers.  It will print the output from the barrier2 functions followed by the output
from the barrier1  functions (as the functions used with barrier2 are actually synchronus, so get executed immediately).
Notice that  the final argument to the test functions is a callback.  
```JavaScript
var syncBarrier = require('syncbarrier')

//Should see output of inline function calls (barrier2) then async calls (barrier1) and complete notifications
test()

function test ()
{
        //Asynch function call
        var barrier1 = new syncBarrier.Barrier(function(){console.log("Complete 1")})
        barrier1.registerFunction(testFunc,4);
        barrier1.registerFunction(testFunc,6);
        barrier1.startWaitComplete();

        //Inline function calls
        var barrier2 = new syncBarrier.Barrier(function(){console.log("Complete 2")})
        barrier2.registerFunction(testFuncBody,7);
        barrier2.registerFunction(testFuncBody,9);
        barrier2.startWaitComplete();
}

function testFunc(num,end)
{
        setTimeout(testFuncBody,10,num,end);
}

function testFuncBody(num,end)
{
        for (var i=0;i<num;i++)
        {
             console.log(i +"/" + num);
        }
        end();
}
```
