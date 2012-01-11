var profile = require('../../lib/ardus').profiler;

function Bob(name) {
  this.name = name;
};

Bob.prototype.is = profile(function foo(adjective) {
  console.log(this.name + ' is ' + adjective);
});

module.exports = Bob;
