var profiler = require('../decorators/profiler'),
		wrap 		 = require('../helpers/wrapper'),
		fs			 = require('fs'),
    dr       = require('doctor')

function globalProfiler(items) {
  require.extensions['.js'] = function (module, fileName) {
    console.log("\nfileName %s", fileName)

    var path = fileName.split('/'),
        file = path[path.length - 1],
        name = file.substring(0, file.length - 3)

    console.log("\nname %s\n", name)

    dr.hookEnterExit(new RegExp(name), function(info) { console.log('Entering', info) })

    module._compile(fs.readFileSync(fileName, 'utf8'), fileName)    
      if (typeof Proxy === 'undefined') 
        module.exports = wrap(profiler.wrap, module.exports)
      else
        module.exports = profiler.proxy(module.exports)
  };
}

exports.profile = globalProfiler