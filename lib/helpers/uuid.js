var hashes = require('../collections/hashes'),
    ids    = { };

function generateUuid(fn, name) {
  if (fn.name.length === 0)
 		var hash = hashes.add(fn.toString());

  return { id: hash || fn.name, anonymous: fn.name.length === 0 || fn.name === '__profiler__' };
}

function uuidFor(fn, name) {
	if (fn) {
 	 	var uu = generateUuid(fn, name);
		
	  if (arguments[1] !== false) {

	    // Determine how many times this function has been invoked so far
	    var invoked = ids[uu.id];

	    // Update the invokation count
	    ids[uu.id] = invoked === undefined ? 0 : (invoked + 1);
	  }
  
	  // Add some convenience data
	  uu.invokations = ids[uu.id];
	  uu.uid         = uu.id + '.' + uu.invokations;

	  return uu;
	}
}

module.exports = uuidFor;