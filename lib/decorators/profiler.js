var profiles = require('../collections/profiles'),
    uuid     = require('../helpers/uuid'),
		wrap	   = require('../helpers/wrapper'),
		time     = require('microtime')

function profile(fn) {
  var modul = arguments[arguments.length - 1]
  return function __profile__ () {
    var u = uuid(fn, modul), 
        prof = {
          id: u.id,
          invokation: u.invokations,
          initialized: time.now(),
          observers: [ ],
          anonymous: u.anonymous },
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
          a.push(wrap(profile, 'OWNER:' + u.uid, af[k], modul));
          prof.observers.push(uuid(af[k], false, modul).id + '.0');
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
  };
}

module.exports = profile;