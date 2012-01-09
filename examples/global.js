var ardus = require('../lib/ardus');

ardus.global('profiler').profile();

var person   = require('./modules/profile'),
    lets     = person.doSomething,
    response = person.callback;

function respond(result) {
  for (var i = 0; i < 1; i++)
    console.log(result += '.');
}

lets('Go BOWLING', respond);

lets('Swim', response);

process.on('exit', function () {
	ardus.helper('summary').generate();
});