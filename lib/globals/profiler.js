var profiler = require('../decorators/profiler'),
		wrap 		 = require('../helpers/wrapper'),
		fs			 = require('fs')


function globalProfiler(items) {
  require.extensions['.js'] = function (module, fileName) {
    module._compile(fs.readFileSync(fileName, 'utf8'), fileName)
    
      if (typeof Proxy === 'undefined') 
        module.exports = wrap(profiler.wrap, module.exports)
      else
        module.exports = profiler.proxy(module.exports)
  };
}

exports.profile = globalProfiler