var pro = require('../decorators/profiler'),
    fs  = require('fs');

function globalProfiler(items) {
  require.extensions['.js'] = function (module, filename) {
    var content = fs.readFileSync(filename, 'utf8');

    module._compile(content, filename);

    if (module.exports.prototype !== undefined &&
        Object.keys(module.exports.prototype).length > 0) {
      Object.keys(module.exports.prototype).forEach(function (prop) {
        var current = module.exports.prototype[prop];

        module.exports.prototype[prop] =
          typeof(current) === 'function' ? pro(current) : current;
      });
    }
    else if (module.exports instanceof Function)
      module.exports = pro(module.exports);
    else if (module.exports instanceof Object)
      for (var k in module.exports)
        if (module.exports.hasOwnProperty(k)) {
          var current = module.exports[k];

          module.exports[k] =
            typeof(current) === 'function' ? pro(current) : current;
        }
  };
}

exports.profile = globalProfiler;