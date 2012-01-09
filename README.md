__Ardus is still under development, so be careful. There is at least one known issue that could bite you.__

__You've been warned...__

![pinch](https://github.com/jdeal/doctor/raw/master/README/pinch-points-warning-143.png)

# Overview

Ardus is a module that provides easy access to helpful functionality. There are currently four types of functionality exposed by Ardus:

* Collections - _Provide a consistent API to collections of useful objects_
* Decorators - _Wrap functions and methods with valuable behavior_
* Globals - _Provide a simple way to apply decorators to all compiled code_
* Helpers - _functions that make life easier_

## Collections

There are currently two types of collections:

* Profiles - _All the data collected during a profiling run_
* Hashes - _A key-value collection of hash values and their associated functions_

These collections are currently used only for profiling. They've been pulled out in case they can be used anywhere else.

## Decorators

This is Ardus' meat & potatoes. Decorators are simply functions that wrap (or decorate) other functions.

An example of a decorator is:

```javascript
function decorate (fn) {
  return function () {
    console.log('Calling ' + fn.name);

    fn.apply(this, arguments);

    console.log(fn.name + ' completed');   
  };
}

function foo() {
  console.log("I'm running!");
}

var decorated = decorate(foo);

decorated();
```

Executing the above code would produce:

```
Calling foo
I'm running!
foo completed
```

There are currently two decorators:

* Profiler - _Records runtime execution information for decorated functions_
* Require - _Wraps code loaded via node's `require` statement in a profiler decorator_

## Globals

Globals simply apply a decorator (or multiple decorators) to all compiled code.

Ardus currently one global: the global profiler.

### Core node code doesn't get wrapped via globals

It's important to note that core node code does not get decorated when using a global. This is because the core node code is compiled prior to the global's compilation, and therefore can't be decorated. To decorate core node code, please use the `require` decorator.

## Helpers

Helpers are basic utility functions. They exist solely to make life easier for you.

There are currently three helpers:

* sha1 - _The hashing algorithm used by the Hashes collection_
* summary - _A human readable version of the output from a run of the profiler decorator_
* uuid - _A Universally Unique ID generator for functions_

# Usage

Ardus has singular and pluralized methods for accessing all of the above-specified functionality.

For example, to get the profiler decorator:

```javascript
var profile = require('ardus').decorator('profiler');
```

### Typing: less is more

There is a shortcut for accessing decorators:

```javascript
var profile = require('ardus').profiler;
```

### Pluralized methods

The pluralized method works as follows:

```javascript
var decorators = require('ardus').decorators('profiler', 'require');
```

The above would return an object literal who's properties are the specified decorators:

```javascript
decorators.profiler // The profiler decorator
decorators.require  // The require decorator
```

### A complete example

```javascript
var ardus      = require('ardus'),
    decorators = ardus.decorators('profiler', 'require'),
    profiled   = decorators.profiler(function test () { console.log('This is a ' + this.name) }),
    my         = decorators.require('path');

var thereYouAre = my.path.resolve('.');

console.log('Where are you? ' + thereYouAre);

profiled();

// We hook into the process exit event to make sure all callbacks have completed
process.on('exit', function() {
	ardus.helper('summary').generate();
});
```

# Reporting issues

I know you'll find issues, report them [here](https://github.com/bsgbryan/Ardus/issues). _KTHX_

# Contributing

If there's anything you want to add/change, please feel free!

Simply:

* Fork Ardus
* Create a topic local branch - git checkout -b topic_branch
* Push to your local branch - git push origin topic_branch
* Create a pull request: github.com/USERNAME/Ardus/pull/new/master
* [Sing](http://g-ecx.images-amazon.com/images/G/01/dvd/lionsgate/barney/B_Sing_Dance_6_lg.jpg), [drink](http://blogs.bostonmagazine.com/chowder/files/2011/04/IMG_0174.jpg), and be happy

# License

Ardus is Copyright © 2012 Bryan Maynard. It is free software, and may be redistributed under the terms specified in the [MIT LICENSE](https://github.com/bsgbryan/Ardus/raw/master/MIT LICENSE) file.