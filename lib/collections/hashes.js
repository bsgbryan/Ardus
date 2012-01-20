var sha1    = require('../helpers/sha1'),
    hashes  = { },
    indexes = [ ],
    values  = [ ];

function add(pre, value) {
  if (pre !== '') {
    if (hashes[pre] === undefined) {
      hashes[pre] = value
      
      indexes.push(pre)
      values.push(value)

      return pre
    } else {
      return pre
    }
  } else {
    var hash = sha1.hash(value);

    if (hashes[hash] === undefined) {
      hashes[hash] = value
      
      indexes.push(hash)
      values.push(value)
    } else {
      // console.log("\nvalue ", value)
    }

    return hash
  }
}

function get(id /*, moreIds... */) {
  var h = { };

  if (arguments.length === 0)
    return hashes;
  else
    for (var k in arguments)
      if (arguments.hasOwnProperty(k))
        h[k] = hashes[k];

  return h;
}

function containsValue(value) {
  return values.indexOf(value) >= 0;
}

function getHashForValue(value) {
  return values[values.indexOf(value)];
}

function at(index /*, moreIndexes... */) {
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

exports.create = add;
exports.add    = add;
exports.get    = get;
exports.getAll = get;
exports.at     = at;

exports.last       = mostRecent;
exports.mostRecent = mostRecent;

exports.containsValue   = containsValue;
exports.getHashForValue = getHashForValue;