var profiles = require('../collections/profiles'),
    uuid     = require('../helpers/uuid'),
		wrap	   = require('../helpers/wrapper');

function profile(fn, name) {
  return function __profiler__() {
		var u = uuid(fn, name);

    // Initialize our profile
    var prof = {
      id: u.id,
      invokation: u.invokations,
      initialized: new Date().getTime(),
      observers: [ ],
      anonymous: u.anonymous
    },
    last = profiles.mostRecent();

    /*
      If the last profile added was for an anonymous function, that means
      it's the function that wrapped us, so:

      1. Specify it as our owner
      2. Add us as an observer
     */      
    if (last && last.anonymous) {
      prof.owner = last.id;
      last.observers.push(u.uid);
    }

    // Add this profile so it can be picked up on the next iteration
    profiles.add(prof);

    // Again, I know assigning properties to prof in this method is a very bad thing,
    // it's just to damned easy to avoid. Sorry.
    function decorate(af) {
      var a = [ ];

      for (var k = 0; k < af.length; k++)
        if (af[k] instanceof Function) {

          // Wrap any function arguments in profile a decorator
          a.push(wrap(profile, 'OWNER:' + u.uid, af[k]));

          // Record this function as an observer of the current function.
          // false here instructs hash to not count this as an invokation
          // of our function.
          prof.observers.push(uuid(af[k], false).id + '.0');

          if (k === af.length - 1)
            prof.callback = 1;

        } else if (af[k] instanceof String && af[k].indexOf('OWNER:') === 0) {
					// console.log("\NMy owner is: %s! For: ", af[k], fn)

          // This function has an owner, so mark it appropriatly
          prof.owner = af[k].substring(6);
        } else {

          // For standard arguments, just push them into the array
          a.push(af[k]);
        }

      return a;
    }
		
    // Keep the raw arguments for reporting/forensics
    prof.rawArgs = arguments;
    prof.args 	 = decorate(arguments);
    prof.start   = new Date().getTime();
    prof.result  = fn.apply(this, prof.args);

    // This is the end for the current function. Callbacks will be ended seperately.
    prof.end = new Date().getTime();

    // If we don't have any observers we can return our results (if we have any)
    if (prof.observers.length === 0)
      return prof.result;
  };
}

module.exports = profile;