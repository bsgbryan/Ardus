var profiles = require('../collections/profiles')
    uuid     = require('../helpers/uuid'),
		wrap	   = require('../helpers/wrapper'),
		time     = require('microtime')

function profile(fn) {
  var modul = arguments[arguments.length - 1]
  
  function __profile__ () {
    
  	/* START Retrieve file & line info */
  	var err  = new Error,
  	    data = [ ]

    Error.captureStackTrace(err, fn.callee)
    var lines = err.stack.split("\n")

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].search(/.*Error|wrap|decorate|__profile__|Object\.\.js|Module|Function|require.*/) === -1) {
        var file = lines[i].split('(')
        
        if (file.length > 1) {
          data = file[1].substring(0, file[1].length - 2).split(':')
        } else {
          file = lines[i].split('/')
          var index = file.length - 1
          data = file[index].substring(0, file[index].length - 2).split(':')
        }
        
        break;
      }
    }
    
    // console.error("\data ", data)

  	modul.file = data[0]
  	modul.line = data[1]
  	/* END Retrieve file & line info */
  	
    var u = uuid(fn, modul), 
        prof = {
          id: u.id,
          invokation: u.invokations,
          initialized: time.now(),
          observers: [ ],
          anonymous: u.anonymous,
          file: modul.file,
          line: modul.line },
        last = profiles.mostRecent(); 
    if (last && last.anonymous) {
      prof.owner = last.id + '.' + last.invokation;
      last.observers.push(u.uid);
    }
    profiles.add(prof);
    function decorate(af) {
      var a = [ ];
      for (var k = 0; k < af.length; k++)
        if (typeof af[k] === 'function') {
          if (af[k].name !== '__profile__') {
            a.push(wrap(profile, 'OWNER:' + u.uid, af[k], modul));
            
            var afk = uuid(af[k], false, modul);
            
            prof.observers.push(afk.id + '.0');
          } else {
            a.push(af[k]);
            
            var afk = uuid(af[k].__fn__, modul);
            
            prof.observers.push(afk.uid);
          }
          if (k === af.length - 1)
            prof.callback = 1;
        } else if (af[k] instanceof String && af[k].indexOf('OWNER:') === 0) {
          prof.owner = af[k].substring(6);
        } else {
          a.push(af[k]);
        }
      return a;
    }
    prof.rawArgs = arguments;
    prof.args 	  = decorate(arguments);
    prof.start   = time.now();
    prof.result  = fn.apply(this, prof.args);
    prof.end     = time.now();
    return prof.result;
  }
  
  __profile__.__fn__ = fn;
  
  return __profile__;
}

module.exports = profile;