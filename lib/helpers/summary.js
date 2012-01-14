var profiles = require('../collections/profiles'),
    output   = [ ], // The raw data used to generate our report
    width    = 0,   // The width of the largest function name
    numWidth = 0,   // This assures all our profile times line up nicely
    buffered = { },
    stream;

function write(value) {
  if (stream)
    stream.write(value);
  else
    console.error(value);
}

function begin() {
  write(' ');
}

function done() {
  write(' ');

  if (stream)
    stream.end();
}

function buffer(p, indent) {
  if (buffered[p.id + '.' + p.invokation] === undefined && p.id !== '__profile__') {
    var t  = p.end - p.start,
        i  = p.start - p.initialized,
        ts = t.toString().length,
        pi = p.id.length + indent;

    width    = pi > width    ? pi : width;
    numWidth = ts > numWidth ? ts : numWidth;

    var data = {
      name: p.id, 
      exec: t, 
      init: i,
      indent: indent, 
      invoke: p.invokation
    }

    output.push(data);
    
    buffered[p.id + '.' + p.invokation] = true;
  }
}

function report() {
  begin();
  
  for (var i in output)
    if (output.hasOwnProperty(i)) {
      var out = output[i],
          all = out.name.split('::');
      
      if (all.length > 1) {
        all.pop()
      
        out.name = all.join(' ')
      }      
      
      for (var j = 0; j < out.indent; j++)
        out.name = ' ' + out.name;

      for (j = out.exec.toString().length; j < numWidth; j++)
        out.exec = ' ' + out.exec;

      write(out.name + '(' + out.invoke + ', ' + out.init + ') -> ' + out.exec);
    }
  
  done();
}

/*
  Here we traverse all a function's observers. This gives us a profiled
  call stack, indented nicely for readability
 */
function recurse(context, item, indent) {
  for (var o = 0; o < item.observers.length; o++) {
    var call = item.observers[o].split('.');

    if (context[call[0]] === undefined)
      continue

    buffer(context[call[0]][parseInt(call[1], 10)], indent);

    var child = context[call[0]][parseInt(call[1], 10)];

    if (child !== undefined && child.observers.length > 0)
      recurse(context, child, indent + 2);
  }
}

function summary(out) {
  if (out)
    stream = out;
  
  var p = profiles.getAll();

  for (var k in p)
    if (p.hasOwnProperty(k)) {
      for (var i = 0; i < p[k].length; i++) {
        buffer(p[k][i]);
        
        if (p[k][i] !== undefined)
          recurse(p, p[k][i], 2);
      }
    }
  
  report();
}

// These are both included merely for readability,
// sometime writeTo makes more sense than generate
exports.generate = summary;
exports.writeTo  = summary;