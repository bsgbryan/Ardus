var profile = require('./profiler');

module.exports = function () {
  var decorated = { };
  var current, name;

  for (var m in arguments) {
    if (arguments.hasOwnProperty(m)) {
      var mod = require(arguments[m]);

      decorated[arguments[m]] = { };

      if (mod.prototype !== undefined &&
          Object.keys(mod.prototype).length > 0) {
        var props = Object.keys(mod.prototype);
        for (var i = 0; i < props.length; i += 1) {
          var prop = props[i];
          current = mod.prototype[prop];
          name    = arguments[m] + '.' + prop;

          decorated[arguments[m]][prop] =
            typeof(current) === 'function' ? profile(current, name) : current;
        }
      }
      else if (mod instanceof Function)
        decorated[arguments[m]] = profile(mod);
      else if (mod instanceof Object) {
        for (var k in mod) {
          if (mod.hasOwnProperty(k)) {
            current = mod[k];
            name    = arguments[m] + '.' + k;

            decorated[arguments[m]][k] =
              typeof(current) === 'function' ? profile(current, name) : current;
          }
        }
      }
    }
  }
  return decorated;
};