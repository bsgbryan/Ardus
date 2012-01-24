var ardus    = require('../lib/ardus'),

// Get the profiler
    profile  = ardus.decorator('profiler'),

    person   = require('./modules/profile'),

// Wrap a function
    response = profile.wrap(person.callback),

    lets     = person.doSomething;

function respond(result) {
  for (var i = 0; i < 1; i++)
    console.log(result += '.');
}

lets('Go BOWLING', respond);

lets('Swim', response);

process.on('exit', function () {
	ardus.helper('summary').generate();
});