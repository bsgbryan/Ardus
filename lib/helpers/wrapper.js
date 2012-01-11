function wrap(/* thingToWrap, argsToWrappedFn..., wrapperFn*/) {    
	var last = arguments.length - 1,
	    me   = arguments[ last ],
			fn 	 = arguments[0],
			args = [ ]
	  
	for (var i = 1; i < last; i++)
		args.push(arguments[i])
		
	return doWrap(me, fn, args)
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
  for (var p in me)
		ctx[p] = wrapItem(me[p], fn, args)
}

function wrapItem(i, fn, args) {
  return i instanceof Function ? fn(i, args) : i
}

function alreadyExists(me) {
  return wrapped[hashes.create(me)] !== undefined
}

module.exports = wrap