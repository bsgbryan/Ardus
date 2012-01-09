var ardus = require('../../lib/ardus');

function secretFinder(foo, bar, baz) {
  for (var i = 0; i < 43; i++) {
    if (i === 0)
      console.log("\nWhat is the answer to %s, %s, and %s?", foo, bar, baz);
    else
      console.log('%s? %s', i, i === 42 ? 'Yep' : 'Nope');
  }
}

module.exports = ardus.ize(secretFinder, 'profiler');