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
	var i      = me,
	    buffer = fn(me, args)
	
	for (var p in i)
		buffer[p] = typeof i[p] === 'function' ? fn(i[p], args) : i[p]
		
	return buffer
}

module.exports = wrap