var ardus = {
  collections: { },
  decorators:  { },
  globals:     { },
  helpers:     { }
};

['collections', 'decorators', 'globals', 'helpers'].forEach(function (dir) {
  require('fs').readdirSync(__dirname + '/' + dir).forEach(function (file) {
    var name = file.substring(0, file.length - 3),
        item = require(__dirname + '/' + dir + '/' + name);

    ardus[dir][name] = item;
  });
});

require('fs').readdirSync(__dirname + '/decorators').forEach(function (file) {
  var name      = file.substring(0, file.length - 3),
      decorator = require(__dirname + '/decorators/' + name);

  exports[name] = decorator;
});

function extract(argsIn) {
  var ctx  = argsIn[0],
      args = [ ];

  if (argsIn.length === 1) {
    for (var k in exports)
      if (exports.hasOwnProperty(k) && k !== 'ize')
        args.push(k);
  } else {
    for (var i = 1; i < argsIn.length; i++)
      if (exports.hasOwnProperty(argsIn[i]))
        args.push(exports[argsIn[i]]);
  }

  return { ctx: ctx, args: args };
}

function arrayify(obj) {
  var arr = [ ];

  for (var k in obj)
    if (obj.hasOwnProperty(k))
      arr.push(obj[k]);

  return arr;
}

function ardusize(decorating, decorators) {
  var my = extract(arguments);

  if (my.ctx.prototype === '[object Object]' && Object.keys(my.ctx.prototype).length > 0) {
    Object.keys(my.ctx.prototype).forEach(function (prop) {
      my.args.forEach(function (arg) {
        var current = my.ctx.prototype[prop];

        my.ctx.prototype[prop] = typeof(current) === 'function' ? arg(current) : current;
      });
    });

    return my.ctx;

  } else if (my.ctx instanceof Function) {
    return function () {
      var args = arguments,
          result;

      my.args.forEach(function (arg) {
        result = arg(my.ctx).apply(my.ctx, arrayify(args));
      });

      return result;
    };
  } else if (my.ctx instanceof Object) {
    var decorated = { };

    my.args.forEach(function (arg) {
      for (var k in my.ctx) {
        if (my.hasOwnProperty(k))
          decorated[k] = typeof(my.ctx[k]) === 'function' ? arg(my.ctx[k]) : my.ctx[k];
      }
    });

    return decorated;
  }
}

function collection(name) {
  return ardus.collections[name];
}

function decorator(name) {
  return ardus.decorators[name];
}

function global(name) {
  return ardus.globals[name];
}

function helper(name) {
  return ardus.helpers[name];
}

function collections(name, anotherName) {
  var c = [ ];

  for (var i = 0; i < arguments.length; i++)
    c.push(ardus.collections[arguments[i]]);

  return c;
}

function decorators(name, anotherName) {
  var d = [ ];

  for (var i = 0; i < arguments.length; i++)
    d.push(ardus.decorators[arguments[i]]);

  return d;
}

function globals(name, anotherName) {
  var g = [ ];

  for (var i = 0; i < arguments.length; i++)
    g.push(ardus.globals[arguments[i]]);

  return g;
}

function helpers(name, anotherName) {
  var h = [ ];

  for (var i = 0; i < arguments.length; i++)
    h.push(ardus.helpers[arguments[i]]);

  return h;
}

exports.ize = ardusize;

exports.collections = collections;
exports.decorators  = decorators;
exports.globals     = globals;
exports.helpers     = helpers;

exports.collection = collection;
exports.decorator  = decorator;
exports.global     = global;
exports.helper     = helper;

Function.prototype.isWrappedWithProfiler = function () {
  return this.__wrapped === true || typeof this.__wrapped === 'function' 
}

Function.prototype.profiled = function() {
  this = exports.profiler.apply(null, this)
}

Array.prototype.last = function() {
  return this[this.length - 1]
}

Array.prototype.lastIndex = function() {
  return this.length - 1
}