var ardus = require('../lib/ardus')

ardus.global('profiler').profile()

var _ = require('underscore')

_.mixin({ foo: function () { console.log('Hi!') } })

_.foo()

process.on('exit', function() {
  ardus.helper('summary').generate()
})