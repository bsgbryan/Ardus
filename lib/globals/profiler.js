var profiler = require('../decorators/profiler'),
		wrap 		 = require('../helpers/wrapper'),
		fs			 = require('fs')


function globalProfiler(items) {
  require.extensions['.js'] = function (module, fileName) {
    module._compile(fs.readFileSync(fileName, 'utf8'), fileName)

    module.exports = wrap(profiler, module.exports)
  };
}

exports.profile = globalProfiler