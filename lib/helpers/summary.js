var profiles  = require('../collections/profiles'),
    output    = [ ], // The raw data used to generate our report
    width     = 0,   // The width of the largest function name
    numWidth  = 0,   // This assures all our profile times line up nicely
    initWidth = 0,
    invkWidth = 0,
    lineWidth = 0,
    buffered  = { },
    chop      = 0,
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
  if (p!== undefined && buffered[p.id + '.' + p.invokation] === undefined && p.id !== '__profile__') {
    var t  = p.end - p.start,
        i  = p.start - p.initialized,
        iw = i.toString().length,
        ts = t.toString().length,
        pi = p.id.length,
        kw = p.invokation.toString().length,
        lw = (p.line || 0).toString().length;

    width     = pi > width     ? pi : width;
    numWidth  = ts > numWidth  ? ts : numWidth;
    initWidth = iw > initWidth ? iw : initWidth;
    invkWidth = kw > invkWidth ? kw : invkWidth;
    lineWidth = lw > lineWidth ? lw : lineWidth;

    var data = {
      name   : p.id, 
      exec   : t, 
      init   : i,
      indent : indent, 
      invoke : p.invokation,
      file   : p.file,
      line   : p.line
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
        
      out.name += ' '
      
      // Don't count the hash generated for anonymous functions when rpadding
      for (var k = out.name.length; k <= width; k++)
        out.name += '-'

      out.name += ' '

      var path = (out.file || '').split('/')

      write(out.name + '(' + 
        lpad(out.invoke, invkWidth) + ', ' + 
        lpad(out.init, initWidth) + 
      ') = ' + 
        lpad(out.exec, numWidth) + ' [' + 
          lpad(out.line || 0, lineWidth) + 
        '] ' +
        path[path.length - 1]);
    }
  
  done();
}

function lpad(input, width) {
  for (var i = input.toString().length; i < width; i++)
    input = ' ' + input;
    
  return input;
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
  
  // console.error("\nProfiles ", p)

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