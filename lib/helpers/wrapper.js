var sha1 = require('./sha1')

function wrap(/* wrapperFn, [argsToWrappedFn...,] thingToWrap, modul ({name: 'foo', methd: 'bar'}) */) {    
	var last  = arguments.length - 1,
	    modul = arguments[ last ]
	    me    = arguments[ last - 1 ],
			fn 	  = arguments[0],
			args  = [ ]

  // If we get a profiler function passed in, return it.
  // We don't end up with functions wrapped with 20 profilers
  var str   = me.toString(),
      start = str.indexOf('{')

  // Don't wrap profile functions
	if (me.name === '__profile__')
	  return me

	for (var i = 1; i < last; i++)
		args.push(arguments[i])
	
	args.push(modul)
	
	var you = doWrap(me, fn, args)
	
	iterateAndWrap(you.prototype, me.prototype, fn, args)
	
	// This needs to be uncommented for tap - I don't know why
  console.info('')
  
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
    
  	if (p !== '__fn__' && 
  	    ctx['__wrapped__'] !== true &&
  	    p !== '__wrapped__' &&
  	    me[p] instanceof Function &&
  	    me[p].name !== '__profile__') {
  	      
      var last = args.pop()
    
      last.methd = p
    
      args.push(last)
  		
  		ctx[p] = wrapItem(me[p], fn, args)
  		ctx[p].__wrapped__ = true
  		
      iterateAndWrap(ctx[p], me[p], fn, args)
		} else {
		  ctx[p] = me[p]
		}
	}
}

function wrapItem(i, fn, args) {
  args.unshift(i)

  return i instanceof Function ? fn.apply(null, args) : i
}

module.exports = wrap