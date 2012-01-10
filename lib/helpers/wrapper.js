function wrap(thing, /* args... */ callMe) {
	var me   = arguments[arguments.length - 1],
			fn 	 = arguments[0],
			args = [ ],
			you  = { }
	
	for (var i = 1; i < arguments.length - 1; i++)
		args.push(arguments[i])
		
	var you = doWrap(me, fn, args)

	if (me && me.prototype)
		you.prototype = doWrap(me.prototype, fn, args)
	
	return you
}

function doWrap(me, fn, args) {
	var buffer = me
	
	for (var p in me)
		buffer[p] = typeof me[p] === 'function' ? fn(me[p], args) : me[p]
		
	return buffer
}

module.exports = wrap