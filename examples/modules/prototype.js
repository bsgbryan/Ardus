function Bob(name) {
  this.name = name;
};

Bob.prototype.is = function foo(adjective) {
  console.log(this.name + ' is ' + adjective);
};

module.exports = Bob;
