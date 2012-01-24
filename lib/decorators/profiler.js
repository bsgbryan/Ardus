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
    if (lines[i].search(/.*Error|\<error\: illegal access\>|Ardus\/lib\/decorators\/profiler|wrap|decorate|__profile__|Object\.\.js|eval at profile|createProfile|Object\.afterWrite|WriteStream\.<anonymous>|callTrace|Module|Function|require.*/) === -1) {
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
        var fn  = typeof Proxy === 'undefined' ? af[k].__wrapped : af[k],
            afk = uuid(fn)

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
        prof  = createProfile(u, fn, initd)
    
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

function handlerMaker(obj) {
  return {
   getOwnPropertyDescriptor: function(name) {
     var desc = Object.getOwnPropertyDescriptor(obj, name);
     // a trapping proxy's properties must always be configurable
     if (desc !== undefined) { desc.configurable = true; }
     return desc;
   },
   getPropertyDescriptor:  function(name) {
     var desc = Object.getPropertyDescriptor(obj, name); // not in ES5
     // a trapping proxy's properties must always be configurable
     if (desc !== undefined) { desc.configurable = true; }
     return desc;
   },
   getOwnPropertyNames: function() {
     return Object.getOwnPropertyNames(obj);
   },
   getPropertyNames: function() {
     return Object.getPropertyNames(obj);                // not in ES5
   },
   defineProperty: function(name, desc) {
     Object.defineProperty(obj, name, desc);
   },
   delete:       function(name) { return delete obj[name]; },   
   fix:          function() {
     if (Object.isFrozen(obj)) {
       var result = {};
       Object.getOwnPropertyNames(obj).forEach(function(name) {
         result[name] = Object.getOwnPropertyDescriptor(obj, name);
       });
       return result;
     }
     // As long as obj is not frozen, the proxy won't allow itself to be fixed
     return undefined; // will cause a TypeError to be thrown
   },
 
   has:          function(name) { return name in obj; },
   hasOwn:       function(name) { return ({}).hasOwnProperty.call(obj, name); },
   get: function(receiver, name) { 

    if (typeof obj[name] === 'function' && 
        name !== 'valueOf' && 
        name !== 'toString' &&
        name !== 'isWrappedWithProfiler' &&
        name !== 'constructor' &&
        name != 'call' &&
        name !== 'apply' &&
        name.indexOf('_') !== 0 &&
        !obj[name].isWrappedWithProfiler()) {
      return profile(obj[name])
    } else {
      return obj[name]
    }
  },
   set:          function(receiver, name, val) { obj[name] = val; return true; }, // bad behavior when set fails in non-strict mode
   enumerate:    function() {
     var result = [];
     for (var name in obj) { result.push(name); };
     return result;
   },
   keys: function() { return Object.keys(obj); }
 
  };
}

exports.wrap  = profile
exports.proxy = function (obj) {
  var handler = handlerMaker(obj),
      p       = Proxy.create(handler, Object.getPrototypeOf(obj))

  if (typeof obj === 'object' && obj.__wrapped === undefined) {
    for (var i in obj)

    var proxy = p

    proxy.__wrapped = true

    return proxy
  } else if (typeof obj === 'function' && obj.__wrapped === undefined) {
    var proxy = Proxy.createFunction(handler, function() {
      var initd = time.now(),
          u     = uuid(obj),
          prof  = createProfile(u, obj, initd)

      profiles.add(prof)

      prof.rawArgs = arguments
      prof.args    = decorate(arguments, u.uid, prof)
      prof.start   = time.now()
      prof.result  = obj.apply(obj, prof.args)
      prof.end     = time.now()

      return prof.result
    }, function () { return p })

    proxy.__wrapped = true

    return proxy
  } else {
    return obj
  }
}