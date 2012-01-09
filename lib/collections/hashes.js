var sha1    = require('../helpers/sha1'),
    hashes  = { },
    indexes = [ ];

function add(value) {
  var hash = sha1.hash(value);

  if (hashes[hash] === undefined)
    hashes[hash] = value;

  indexes.push(hash);
  
  return hash;
}

function get(id, anotherId) {
  var h = { };

  if (arguments.length === 0)
    return hashes;
  else
    for (var k in arguments)
      if (arguments.hasOwnProperty(k))
        h[k] = hashes[k];

  return h;
}

function at(index, anotherIndex) {
  var h = [ ];

  if (arguments.length === 1)
    return hashes[indexes[index]];
  else
    for (var k in arguments)
      if (arguments.hasOwnProperty(k))
        h.push(hashes[indexes[arguments[k]]]);

  return h;
}

function mostRecent() {
  return indexes[indexes.length - 1];
}

exports.create     = add;
exports.add        = add;
exports.get        = get;
exports.getAll     = get;
exports.at         = at;
exports.last       = mostRecent;
exports.mostRecent = mostRecent;