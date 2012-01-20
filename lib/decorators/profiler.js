var profiles = require('../collections/profiles'),
    uuid     = require('../helpers/uuid'),
    wrap	   = require('../helpers/wrapper'),
    time     = require('microtime')

function createProfile (u, fn, initd) { 
  return {
    uid         : u.uid,
    invokation  : u.invokations,
    initialized : initd,
    observers   : [ ],
    file        : callTrace(fn)
  }
}

function callTrace(fn) { 
  var err  = new Error,
	    data = [ ]

  Error.captureStackTrace(err, fn.callee)
  var lines = err.stack.split("\n")

  for (var i = 0; i < lines.length; i++)
    if (lines[i].search(/.*Error|wrap|decorate|__profile__|Object\.\.js|eval at profile|createProfile|Object\.afterWrite|WriteStream\.<anonymous>|callTrace|Module|Function|require.*/) === -1) {
      var file = lines[i].split('(')
          line = file.length === 2 ? file[1] : lines[i]

      return line.substring(0, line.length - 2)
    }
}

function decorate (af, uid, prof) { 
  var a = [ ]

  for (var k = 0; k < af.length; k++)
    if (typeof af[k] === 'function') {      
      if (!af[k].isWrappedWithProfiler()) {

        a.push(wrap(profile, 'OWNER:' + uid, af[k]))

        var afk = uuid(af[k], false)

        prof.observers.push(afk.uid)
      } else {
        a.push(af[k])

        // Get the uuid for the wrapped function
        var afk = uuid(af[k].__wrapped)

        prof.observers.push(afk.uid)
      }
    } else if (af[k] instanceof String && af[k].indexOf('OWNER:') === 0) {
      prof.owner = af[k].substring(6)
    } else {
      a.push(af[k])
    }
  return a
}

function profile (fn) {

  function BROfile () {
    var initd = time.now(),
        u     = uuid(fn),
        prof  = createProfile(u, fn, initd),
        last  = profiles.mostRecent()
    
    profiles.add(prof)

    prof.rawArgs = arguments
    prof.args 	 = decorate(arguments, u.uid, prof)
    prof.start   = time.now()
    prof.result  = fn.apply(this, prof.args)
    prof.end     = time.now()

    return prof.result
  }
    
  var str = BROfile.toString(),
      idx = str.indexOf('('),
      p   = eval('(function ' + fn.name + str.substring(idx) + ')')
      
  p.__wrapped = fn
  
  return p
}

function Profiler(target) {
  this.target = target
}

Profiler.prototype = {
  // Object.getOwnPropertyDescriptor(proxy, name) -> pd | undefined
  getOwnPropertyDescriptor: function(name) {
    var desc = Object.getOwnPropertyDescriptor(this.target);
    desc.configurable = true;
    return desc;
  },

  // Object.getOwnPropertyNames(proxy) -> [ string ]
  getOwnPropertyNames: function() {
    return Object.getOwnPropertyNames(this.target);
  },

  // Object.defineProperty(proxy, name, pd) -> undefined
  defineProperty: function(name, desc) {
    return Object.defineProperty(this.target, name, desc);
  },

  // delete proxy[name] -> boolean
  'delete': function(name) { return delete this.target[name]; },

  // Object.{freeze|seal|preventExtensions}(proxy) -> proxy
  fix: function() {
    // As long as target is not frozen, the proxy won't allow itself to be fixed
    // if (!Object.isFrozen(this.target)) // FIXME: not yet implemented
    //     return undefined;
    // return Object.getOwnProperties(this.target); // FIXME: not yet implemented
    var props = {};
    for (var name in this.target) {
      props[x] = Object.getOwnPropertyDescriptor(this.target, name);
    }
    return props;
  },

  // name in proxy -> boolean
  has: function(name) { return name in this.target; },

  // ({}).hasOwnProperty.call(proxy, name) -> boolean
  hasOwn: function(name) { return ({}).hasOwnProperty.call(this.target, name); },

  // proxy[name] -> any
  get: function(receiver, name) { 
    var initd = time.now(),
        u     = uuid(this.target[name], this.target.name, name),
        prof  = createProfile(u, fn, initd),
        last  = profiles.mostRecent()

    if (last && last.anonymous) {
      prof.owner = last.id + '.' + last.invokation
      last.observers.push(u.uid)
    }

    profiles.add(prof)

    prof.rawArgs = arguments
    prof.args 	 = decorate(arguments, u.uid, prof)
    prof.start   = time.now()
    prof.result  = fn.apply(this, prof.args)
    prof.end     = time.now()

    return prof.result
  },

  // proxy[name] = val -> val
  set: function(receiver, name, val) {
    this.target[name] = val;
    // bad behavior when set fails in non-strict mode
    return true;
  },

  // for (var name in Object.create(proxy)) { ... }
  enumerate: function() {
    var result = [];
    for (name in this.target) { result.push(name); };
    return result;
  },

  // for (var name in proxy) { ... }
  iterate: function() {
    var props = this.enumerate();
    var i = 0;
    return {
      next: function() {
        if (i === props.length) throw StopIteration;
        return props[i++];
      }
    };
  },

  // Object.keys(proxy) -> [ string ]
  enumerateOwn: function() { return Object.keys(this.target); },
  keys: function() { return Object.keys(this.target); }
}

exports.wrap  = profile
exports.proxy = function (obj) {
  return new Profiler(obj);
}