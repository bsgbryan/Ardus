var ardus = require('../lib/ardus')

ardus.global('profiler').profile()

var _ = require('underscore')

console.log("\nUNDERSCORE = ", _)

_.mixin({ foo: function foo() { console.log('Hi!') } })

_.foo()

process.on('exit', function() {
  ardus.helper('summary').generate()
})