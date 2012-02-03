var profiler = require('../decorators/profiler'),
    wrap     = require('../helpers/wrapper'),
    fs       = require('fs'),
    dr       = require('doctor'),
    config   = require('../../config.json'),
    hashes   = require('../collections/hashes'),
    profiles = require('../collections/profiles'),
    time     = require('microtime')
    fns      = { }

function _set(prop, value) {
  if (typeof prop === 'string')
    this[prop] = value
  else
    for (var i in prop)
      if (prop.hasOwnProperty(i))
        _set.call(this, i, prop[i])
}

function globalProfiler(items) {
  require.extensions['.js'] = function (module, file) {
    var skip = false,
        prof = { }

    var reg = function register(info) {

      if (info.type.indexOf('function') > -1) {
      
        var prof = profiles.register(info.source, file),
            name = info.source.substring(9, info.source.indexOf('('))

        name = name === '' ? hashes.add('', file + info.line + info.column) : name

        this[file + '::' + name] = prof
      }
    }.bind(fns)

    var enter = function enter(info) {

      if (info.type.indexOf('function') > -1) {

        var name    = info.name === 'function' ? hashes.add('', file + info.line + info.column) : info.name
            profile = this[file + '::' + name],
            latest  = profile.get('invokations').length - 1
        
        if (latest === -1) {

          var prof = { initialized: time.now(), observers: [ ] }
              p    = { 
                set: function()     { _set.apply(prof, arguments); return this; },
                get: function(prop) { return prof[prop]  }
              }
          
          profile.get('invokations').push(p)

          latest = 0
        }

        profile.
          set({line: info.line, column: info.column}).
          get('invokations')[latest].
          set('start', time.now())
      }
    }.bind(fns)

    var exit = function exit(info) {
      if (info.type.indexOf('function') > -1) {
        var name    = info.name === 'function' ? hashes.add('', file + info.line + info.column) : info.name
            profile = this[file + '::' + name],
            latest  = profile.get('invokations').length - 1
        
        if (latest === -1) {
          var prof = { initialized: time.now(), observers: [ ] }
              p    = { 
                set: function()     { _set.apply(prof, arguments); return this; },
                get: function(prop) { return prof[prop]  }
              }
          
          profile.get('invokations').push(p)

          latest = 0
        }

        profile.
          get('invokations')[latest].
          set('end', time.now())
      }
    }.bind(fns)

    for (var i = 0; i < config.no.length; i++)
      if (file.indexOf(config.no[i]) > -1) {
        skip = true
        break
      }

    if (skip === false) {
      module._compile(dr.insertEnterExitHooksSync(file, enter, exit, reg), file)    

      if (typeof Proxy === 'undefined') 
        module.exports = wrap(profiler.wrap, module.exports)
      else
        module.exports = profiler.proxy(module.exports)

    } else
      module._compile(fs.readFileSync(file, 'utf8'), file)
  };
}

exports.profile = globalProfiler