/*
syncBarrier: This module provides a simple synchronisation barrier
for use with nodejs to allow the running of a function after two or more
other asynchronos calls have completed.

Copyright 2015 James W. Matheson

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
if (require.main === module)
{
     console.log("Running synchBarrier Test");
     test();
} else
{
    module.exports.Barrier = Barrier;
}

//Should see output of inline functiojn calls (barrier2) then Asycnh calls (barrier1) and pass notifications
function test ()
{
    //Asynch function call
     var barrier = new Barrier(function(){console.log("Passed 1")})
     barrier.registerFunction(testFunc,4);
     barrier.registerFunction(testFunc,6);
     barrier.startWaitComplete();
     //Inline function calls
     var barrier2 = new Barrier(function(){console.log("Passed 2")})
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


function Barrier(doneFunction)
{
    this.functionCount = 0;
    this.waiting = false;
    this.allDoneFunction = doneFunction
    this.oneDoneFunction = oneDoneFunctionClosure(this);
    this.startWaitComplete = startWaitComplete;
    this.registerFunction = registerFunction;

    //not using slice function as is recommended against on MDN arguments article.
    if (arguments.length===1)
    {
           this.allDoneArgs = [];
    } else
    {
        var argArray = Array(arguments.length-1);
        for ( var i = 1; i < (arguments.length);i++)
        {
              argArray[i-1] = arguments[i];
        }
        this.allDoneArgs= argArray;
   }
}

//expect first argument is function subsequent arguments are args for function excluding call back argument
function registerFunction()
{
        if(this.waiting===true)
        {
                throw "SyncBarrier: You may not regsiter a function once you have started waiting for completion";
        }

        var funcToCall = arguments[0];
        //convert arguments to array and take from 1 to end

        //not using slice function as is recommended against on MDN arguments article.
        var argArray = Array(arguments.length);
        for ( var i = 1; i < (arguments.length);i++)
        {
              argArray[i-1] = arguments[i];
        }
        argArray[arguments.length-1] = this.oneDoneFunction;
        this.functionCount++;

         funcToCall.apply(null, argArray);

}

function startWaitComplete()
{
      if (this.functionCount===0)
      {
           this.allDoneFunction.apply(null,this.allDoneArgs);
      } else {
         this.waiting=true;
      }

}


function oneDoneFunctionClosure(selfRef)
{
        return(function ()  {
            selfRef.functionCount--;
            if (selfRef.waiting)
            {
                 if (selfRef.functionCount===0)
                  {
                       selfRef.allDoneFunction.apply(null,selfRef.allDoneArgs);
                  }
            }
      });
}
