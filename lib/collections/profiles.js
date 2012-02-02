var profiles = { },
    indexes  = [ ],
    uuid     = require('../helpers/uuid'),
    hashes   = require('./hashes'),
    time     = require('microtime');

function _set(prop, value) {
  if (typeof prop === 'string')
    this[prop] = value
  else
    for (var i in prop)
      if (prop.hasOwnProperty(i))
        _set.call(this, i, prop[i])
}

function register(source, file) {
  var hash = hashes.add('', source),
      name = source.substring(9, source.indexOf('('))

  profiles[hash] = { file: file, name: name === '' ? hash : name, invokations: [ ] }

  return { 
    set: function()     { _set.apply(profiles[hash], arguments); return this; },
    get: function(prop) { return profiles[hash][prop]  }
  }
}

// This needs to be updated to support hte new data structure:
// { 'functionHash': 
//    { file   : 'file/name.js',
//      name   : 'doSomething',
//      line   : 1,
//      column : 1,
//      invokations: [
//        Old profile data structure
//      ] }
// }
function add(fn) {
  var init = time.now(),
      prof = { initialized: init, observers: [ ] },
      id   = hashes.add('', fn.toString()),
      p    = { 
        set: function()     { _set.apply(prof, arguments); return this; },
        get: function(prop) { return prof[prop]  }
      }
  
  if (typeof profiles[id] === 'undefined')
    register(fn.toString())

  profiles[id].invokations.push(p)
  
  return p
}

function get(id) {
  var p = [ ]

  if (arguments.length >= 1)
    for (var i = 0; i < arguments.length; i++) {
        // console.log("\nargument ", arguments[i])
        var id = arguments[i].split('.')
        p.push(profiles[id[0]][id[1]])
      }
  else
    p = profiles

  return p;
}

function at(index) {
  return profiles[indexes[index]];
}

function mostRecent() {
  var get = indexes[indexes.length - 1];

  if (get !== undefined) {
    get = get.split('.');

    var invokation = parseInt(get.pop(), 10),
        profile    = get.join('.');

    return profiles[profile][invokation];
  }
}

exports.create     = add;
exports.add        = add;
exports.get        = get;
exports.getAll     = get;
exports.at         = at;
exports.register    = register;
exports.last       = mostRecent;
exports.mostRecent = mostRecent;