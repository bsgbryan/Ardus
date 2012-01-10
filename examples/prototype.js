var ardus = require('../lib/ardus');

ardus.global('profiler').profile();

var Bob = require('./modules/prototype'),
    bob = new Bob('Dave');

console.log("\nMy prototype: ", bob.prototype);

bob.is('cool');

process.on('exit', function () {
	ardus.helper('summary').generate();
});