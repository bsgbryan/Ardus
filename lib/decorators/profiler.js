var profiles = require('../collections/profiles'),
    uuid     = require('../helpers/uuid'),
    wrap	   = require('../helpers/wrapper'),
    time     = require('microtime')

function profile (fn) {
  var initd = time.now()

  function BROfile () {  
    var u    = uuid(fn),
        prof = createProfile(u, fn, initd),
        last = profiles.mostRecent()
    
    function createProfile (u) {
      var cawl = callTrace()

      return {
        id          : u.id,
        invokation  : u.invokations,
        initialized : initd,
        observers   : [ ],
        anonymous   : u.anonymous,
        file        : cawl.file,
        line        : cawl.line
      }
    }

    function callTrace() {
      var err  = new Error,
    	    data = [ ]

      Error.captureStackTrace(err, fn.callee)
      var lines = err.stack.split("\n")

      for (var i = 0; i < lines.length; i++) {
        if (lines[i].search(/.*Error|wrap|decorate|__profile__|Object\.\.js|eval at profile|Module|Function|require.*/) === -1) {
          var file = lines[i].split('(')
              line = file.length === 1 ? lines[i] : file[1],
              data = line.substring(0, line.length - 2)

          break
        }
      }

    	return { file: data[0], line: data[1] }
    }

    function decorate (af, uid) {
      var a = [ ]

      for (var k = 0; k < af.length; k++)
        if (typeof af[k] === 'function') {      
          if (!af[k].isWrappedWithProfiler()) {
            a.push(wrap(profile, 'OWNER:' + uid, af[k]))

            var afk = uuid(af[k], false)

            prof.observers.push(afk.id + '.0')
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

    if (last && last.anonymous) {
      prof.owner = last.id + '.' + last.invokation
      last.observers.push(u.uid)
    }

    profiles.add(prof)

    prof.rawArgs = arguments
    prof.args 	 = decorate(arguments, u.uid)
    prof.start   = time.now()
    prof.result  = fn.apply(this, prof.args)
    prof.end     = time.now()

    return prof.result
  }
    
  var str = BROfile.toString(),
      idx = str.indexOf('('),
      p = eval('(function ' + fn.name + str.substring(idx) + ')')
      
  p.__wrapped = fn
  
  return p
}

module.exports = profile