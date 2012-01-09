var profiles = require('../collections/profiles'),
    output   = [ ], // The raw data used to generate our report
    width    = 0,   // The width of the largest function name
    numWidth = 0,   // This assures all our profile times line up nicely
    stream;

function write(value) {
  if (stream)
    stream.write(value);
  else
    console.log(value);
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
  var t  = p.end - p.start,
      ts = t.toString().length,
      pi = p.id.length + indent;

  width    = pi > width    ? pi : width;
  numWidth = ts > numWidth ? ts : numWidth;

  // Remove the noise from the id we'll display
  if (p.id.indexOf('function') === 0)
    p.id = p.id.substring(9);

  output.push({ name: p.id, time: t, indent: indent });
}

function report() {
  begin();
  
  for (var i in output)
    if (output.hasOwnProperty(i)) {
      var out = output[i];
      
      for (var j = 0; j < out.indent; j++)
        out.name = ' ' + out.name;

      out.name += ' ';
      
      for (var l = out.name.length; l <= width; l++)
        out.name += '-';

      out.name += '->';

      for (j = out.time.toString().length; j < numWidth; j++)
        out.time = ' ' + out.time;

      write(out.name + ' ' + out.time);
    }
  
  done();
}

/*
  Here we traverse all a function's observers. This gives us a profiled
  call stack, indented nicely for readability
 */
function recurse(context, item, indent) {
  for (var o in item.observers)
    if (item.observers.hasOwnProperty(o)) {
      var call = item.observers[o].split('.');

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
    if (p.hasOwnProperty(k))
      for (var i = 0; i < p[k].length; i++) {
        buffer(p[k][i]);
        
        if (p[k][i] !== undefined)
          recurse(p, p[k][i], 2);
      }
  
  report();
}

// These are both included merely for readability,
// sometime writeTo makes more sense than generate
exports.generate = summary;
exports.writeTo  = summary;