var no = require('../../config.json').no

function wrap(/* wrapperFn, [argsToWrappedFn...,] thingToWrap, modul ({name: 'foo', methd: 'bar'}) */) {    
	var last = arguments.length - 1,
	    me   = arguments[ last ],
			fn 	 = arguments[0],
			args = [ ]

  // Don't wrap profile functions
	if (me instanceof Function && me.isWrappedWithProfiler())
	  return me

	for (var i = 1; i < last; i++)
		args.push(arguments[i])
	

	var you = doWrap(me, fn, args)
	
	iterateAndWrap(you.prototype, me.prototype, fn, args)
	
	// This needs to be here for tap - I don't know why
  process.stdout.write('')
  
	return you
}

function doWrap(me, fn, args) {
  var buffer;
  
	if (me instanceof Function)
    if (me.name.search(/[A-Z]/) < 0 || me.name.search(/[A-Z]/) > 0)
  	  buffer = wrapItem(me, fn, args)
    else
      buffer = me
  else
    buffer = me
	
	iterateAndWrap(buffer, me, fn, args)
		
	return buffer
}

function iterateAndWrap(ctx, me, fn, args) {
  for (var p in me)
  	if (p !== 'isWrappedWithProfiler')
  	  if (me[p] instanceof Function) {
    	  if (ctx instanceof Function && !ctx.isWrappedWithProfiler())
    	    ctx[p] = wrapItem(me[p], fn, args)
    	  else if (ctx instanceof Object && !me[p].isWrappedWithProfiler())
    	    ctx[p] = wrapItem(me[p], fn, args)
  		} else {  
  		  ctx[p] = me[p]
  		}
}

function wrapItem(i, fn, args) {
  args.unshift(i)

  var decorator

  if (typeof fn === 'object')
    decorator = typeof Proxy === 'undefined' ? fn.wrap : fn.proxy
  else if (typeof fn === 'function')
    decorator = fn

  return i instanceof Function ? decorator.apply(null, args) : i
}

module.exports = wrap