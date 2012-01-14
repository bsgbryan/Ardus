var sha1 = require('./sha1')

function wrap(/* thingToWrap, argsToWrappedFn..., wrapperFn*/) {    
	var last  = arguments.length - 1,
	    modul = arguments[ last ]
	    me    = arguments[ last - 1 ],
			fn 	  = arguments[0],
			args  = [ ]

  // If we get a profiler function passed in, return it.
  // We don't end up with functions wrapped with 20 profilers
  var str   = me.toString(),
      start = str.indexOf('{')
  
	if (sha1.hash(str.substring(start)) === '9ad7c8cfe951569ee2466592513ffad1aa682c35')
	  return me

	for (var i = 1; i < last; i++)
		args.push(arguments[i])
	
	args.push(modul)
	
	var you = doWrap(me, fn, args)
	
  iterateAndWrap(you.prototype, me.prototype, fn, args)
	
	return you
}

function doWrap(me, fn, args) {
  var buffer;
  
	if (me instanceof Function)
	  if (me.name.search(/[A-Z]/) < 0 || me.name.search(/[A-Z]/) > 0) {        
  	  buffer = wrapItem(me, fn, args)
    } else {
      buffer = me
    }
  else
    buffer = me
	
	iterateAndWrap(buffer, me, fn, args)
		
	return buffer
}

function iterateAndWrap(ctx, me, fn, args) {    
  for (var p in me) {
    var last = args.pop()
    
    last.methd = p
    
    args.push(last)
		
		ctx[p] = wrapItem(me[p], fn, args)
	}
}

function wrapItem(i, fn, args, module) {
  args.unshift(i)

  return i instanceof Function ? fn.apply(null, args) : i
}

function alreadyExists(me) {
  return wrapped[hashes.create(me)] !== undefined
}

module.exports = wrap