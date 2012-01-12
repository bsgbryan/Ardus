var profiler = require('../decorators/profiler'),
		wrap 		 = require('../helpers/wrapper'),
		fs			 = require('fs')


function globalProfiler(items) {
  require.extensions['.js'] = function (module, fileName) {
    module._compile(fs.readFileSync(fileName, 'utf8'), fileName)
    
    var mod  = fileName.split('/'),
        len  = mod[mod.length - 1],
        name = len.substring(0, len.length - 3)
    
    module.exports = wrap(profiler, module.exports, { name: name })
  };
}

exports.profile = globalProfiler