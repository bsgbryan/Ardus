var profiles = require('../collections/profiles'),
    uuid     = require('../helpers/uuid'),
		wrap	   = require('../helpers/wrapper'),
		time     = require('microtime'),
		vm       = require('vm'),
		
		// The template for the functions that will get generated
		body = "var u = uuid(fn, modul),"+ 
        "prof = {" +
          "id: u.id," +
          "invokation: u.invokations," +
          "initialized: time.now()," +
          "observers: [ ]," +
          "anonymous: u.anonymous }," +
        "last = profiles.mostRecent();" + 
    "if (last && last.anonymous) {" +
      "prof.owner = last.id;" +
      "last.observers.push(u.uid);" +
    "}" +
    "profiles.add(prof);" +
    "function decorate(af) {" +
      "var a = [ ];" +
      "for (var k = 0; k < af.length; k++)" +
        "if (typeof af[k] === 'function') {" +
          "a.push(wrap(profile, 'OWNER:' + u.uid, af[k], modul));" +
          "prof.observers.push(uuid(af[k], false, modul).id + '.0');" +
          "if (k === af.length - 1)" +
            "prof.callback = 1;" +
        "} else if (af[k] instanceof String && af[k].indexOf('OWNER:') === 0) {" +
          "prof.owner = af[k].substring(6);" +
        "} else {" +
          "a.push(af[k]);" +
        "}" +
      "return a;" +
    "}" +
    "prof.rawArgs = arguments;" +
    "prof.args 	  = decorate(arguments);" +
    "prof.start   = time.now();" +
    "prof.result  = fn.apply(this, prof.args);" +
    "prof.end     = time.now();" +
    "return prof.result;";

function profile(fn) {
  
  var modul   = arguments[arguments.length - 1],
      context = {
        profiles : profiles,
        profile  : profile,
        console  : console,
        modul    : modul,
        wrap     : wrap,
        uuid     : uuid,
        time     : time,
        fn       : fn },
      profiler = 'funk = function ' + fn.name + ' () {' + body + '}'
  
  return vm.runInNewContext(profiler, context, 'ardus.vm');
}

module.exports = profile;