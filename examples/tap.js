var ardus = require('../lib/ardus')

ardus.global('profiler').profile()

var test  = require('tap').test

test('An example test', function(t) {
  t.plan(1)
  t.ok(true, 'is the loneliest number') // Say that five times fast...
})

process.on('exit', function() {
  ardus.helper('summary').generate()
})