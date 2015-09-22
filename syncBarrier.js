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
var barrierArgumentCount =2;

function Barrier(onCompleteFunction,onCompleteObject)
{
  this.functionCount = 0;
  this.waiting = false;
  this.allFunctionsDone = onCompleteFunction;
  this.allFunctionsDoneObject = onCompleteObject;

  if (arguments.length <= barrierArgumentCount)
  {
    this.allDoneArgs = [];
  } else
  {
    this.allDoneArgs = createFunctionArgumentsArray(arguments);
  }
}

Barrier.prototype.registerFunction = function(targetFunction,targetObject)
{
  if(this.waiting===true)
  {
    throw "SyncBarrier: You may not regsiter a function once you have started waiting for completion";
  }

  //convert arguments to array and take from 1 to end
  var argArray = createFunctionArgumentsArray(arguments);
  argArray[argArray.length] = oneFunctionDoneClosure(this);
  this.functionCount++;

  targetFunction.apply(targetObject, argArray);

}

Barrier.prototype.startWaitComplete = function ()
{
  if (this.functionCount===0)
  {
    this.allFunctionsDone.apply(this.allFunctionsDoneObject,this.allDoneArgs);
  } else {
    this.waiting=true;
  }

}

function oneFunctionDoneClosure(self)
{

  return( function()
  {
    self.functionCount--;
    if (self.waiting)
    {
      if (self.functionCount===0)
      {
        self.allFunctionsDone.apply(self.allFunctionsDoneObject,self.allDoneArgs);
      }
    }

  });
}

function createFunctionArgumentsArray(argumentObject)
{
  //not using slice function as arguments object is not a full blooded array.
  var argArray = Array(argumentObject.length-barrierArgumentCount);
  for ( var i = barrierArgumentCount; i < (argumentObject.length);i++)
  {
        argArray[i-barrierArgumentCount] = argumentObject[i];
  }
  return argArray;
}

if (require.main === module)
{
  console.log("Running synchBarrier Test");
  test();
} else
{
  module.exports.Barrier = Barrier;
}

// <test>

function test ()
{

  var tests=[];
  tests[0] = function(testArray,testIndex) {
    console.log("Test 1: No arguments for registered functions\n Should print 0 twice on seperate lines.");
    var barrier = new Barrier(testComplete,null,"Test 1 Complete",testArray,testIndex);
    barrier.registerFunction(testNoFunctionArguments,null);
    barrier.registerFunction(testNoFunctionArguments,null);
    barrier.startWaitComplete();
  }

  tests[1] = function(testArray,testIndex) {
  console.log("\nTest 2: Multiple barriers with arguments for registered functions\n Should print (all on seperate lines) 3, 4, 'Barrier 2 Complete'  and then 1,2 or 2,1, 'Barrier 1 Complete'\nTest results below.");
  //Delayed (Asynch) Calls
  var barrier = new Barrier(testComplete,null,"Barrier 1 Complete",testArray,testIndex);
  barrier.registerFunction(testFunction,null,1);
  barrier.registerFunction(testFunction,null,2);
  barrier.startWaitComplete();
  //Inline function calls
  var barrier2 = new Barrier(console.log,null,"Barrier 2 Complete");
  barrier2.registerFunction(testFunctionSync,null,3);
  barrier2.registerFunction(testFunctionSync,null,4);
  barrier2.startWaitComplete();
  }

  tests[2] = function(testArray,testIndex) {
  console.log("\nTest 3: Object bound function\n Should print 2 and 3 on seperate lines.");
  var testObject = new TestObject(1);
  var barrier = new Barrier(testComplete,null,"Test 3 Complete",testArray,testIndex);
  barrier.registerFunction(testObject.testFunction,testObject,1);
  barrier.registerFunction(testObject.testFunction,testObject,2);
  barrier.startWaitComplete();
 }

 tests[3] = function(testArray,testIndex) {
  console.log("\nTest 4: Object bound function, Object not passed\n Should print NaN.");
  var testObject = new TestObject(1);
  var barrier = new Barrier(testComplete,null,"Test 4 Complete",testArray,testIndex);
  barrier.registerFunction(testObject.testFunction,null,1);
  barrier.startWaitComplete();
 }

  tests[4] = function(testArray,testIndex) {
  console.log("\nTest 5: register function after start wait\n Should print exception.");
  var barrier = new Barrier(console.log,null,"Test 5 Complete");
  barrier.registerFunction(testFunction,null,1);
  barrier.startWaitComplete();
  try {
    barrier.registerFunction(testFunction,null,2);
  } catch (ex) {
    console.log(ex)
  }
  }

  console.log("There are " + tests.length.toString() + " tests to run.");
  tests[0](tests,0);
}

function TestObject(number)
{
  this.value = number;
}

TestObject.prototype.testFunction = function(arg,end) {
  testFunction(this.value+arg,end);
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

function testNoFunctionArguments(end)
{
  testFunction(0,end);
}

function testComplete(message,testArray,testIndex)
{
   console.log(message);
   testIndex++;
   if (testIndex < (testArray.length))
   {
      testArray[testIndex](testArray,testIndex);
   }
}
// </test>
