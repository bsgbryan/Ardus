var profiler = require('../decorators/profiler'),
    config   = require('../../config.json'),
		wrap 		 = require('../helpers/wrapper'),
		fs			 = require('fs')


function globalProfiler(items) {
  require.extensions['.js'] = function (module, fileName) {
    module._compile(fs.readFileSync(fileName, 'utf8'), fileName)
    
      var mod  = fileName.split('/'),
          len  = mod[mod.length - 1],
          name = len.substring(0, len.length - 3)
          
      // If this module isn't on the blacklist, wrap it
      if (config.no.indexOf(name) === -1)
        module.exports = wrap(profiler, module.exports)
  };
}

exports.profile = globalProfiler