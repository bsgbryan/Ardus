var hashes = require('../collections/hashes'),
    ids    = { }

function generateUuid(/* fn [, object || name, method] */) {
  var fn  = arguments[0],
      pre = fn.name
      
  for (var i = 1; i < arguments.length; i++)
    if (typeof arguments[i] === 'string')
      pre +=  '.' + arguments[i]

  return hashes.add(pre, fn.toString())
}

function uuidFor() {
	var uuid = generateUuid.apply(null, arguments);
	
  if (arguments[arguments.length - 1] !== false)
    ids[uuid] = ids[uuid] === undefined ? 0 : (ids[uuid] + 1);

  return { invokations: (ids[uuid] || 0), uid: uuid + '.' + (ids[uuid] || 0) }
}

module.exports = uuidFor;