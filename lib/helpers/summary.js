var profiles  = require('../collections/profiles'),
    output    = [ ], // The raw data used to generate our report
    width     = 0,   // The width of the largest function name
    numWidth  = 0,   // This assures all our profile times line up nicely
    initWidth = 0,
    buffered  = { },
    chop      = 0,
    maxIndent = 0,
    stream;

// function write(value) {
//   if (stream)
//     stream.write(value);
//   else
//     console.error(value);
// }

// function begin() {
//   write(' ');
// }

// function done() {
//   write(' ');

//   if (stream)
//     stream.end();
// }

// function buffer(p, indent) {
//   if (p !== undefined && 
//       buffered[p.uid] === undefined && 
//       p.uid.indexOf('isWrappedWithProfiler') === -1
//   ) {
//     var t  = p.end - p.start,
//         i  = p.start - p.initialized,
//         iw = i.toString().length,
//         ts = t.toString().length,
//         pi = p.uid.length

//     width     = pi > width     ? pi : width;
//     numWidth  = ts > numWidth  ? ts : numWidth;
//     initWidth = iw > initWidth ? iw : initWidth;
    
//     maxIndent = indent > maxIndent ? indent : maxIndent;

//     var data = {
//       name   : p.uid, 
//       exec   : t, 
//       init   : i,
//       indent : indent,
//       file   : p.file
//     }

//     output.push(data);
    
//     buffered[p.uid] = true;
//   }
// }

// function report() {
//   begin();
  
//   for (var i in output)
//     if (output.hasOwnProperty(i)) {
//       var out = output[i]
      
//       for (var j = 0; j < out.indent; j++)
//         out.name = ' ' + out.name;
        
//       out.name += ' '
      
//       for (var k = out.name.length; k < width + maxIndent; k++)
//         out.name += '-'

//       out.name += ' '

//       write(out.name + '(' + lpad(out.init, initWidth) + 
//       ') = ' + 
//         lpad(out.exec, numWidth) + ' ' + out.file
//       );
//     }
  
//   done();
// }

// function lpad(input, width) {
//   for (var i = input.toString().length; i < width; i++)
//     input = ' ' + input;
    
//   return input;
// }

// /*
//   Here we traverse all a function's observers. This gives us a profiled
//   call stack, indented nicely for readability
//  */
// function recurse(context, item, indent) {
//   for (var o = 0; o < item.observers.length; o++) {
//     var call = item.observers[o].split('.');

//     if (context[call[0]] === undefined)
//       continue

//     buffer(context[call[0]][parseInt(call[1], 10)], indent);

//     var child = context[call[0]][parseInt(call[1], 10)];

//     if (child !== undefined && child.observers.length > 0)
//       recurse(context, child, indent + 1);
//   }
// }

function summary(out) {
  if (out)
    stream = out;
  
  var p = profiles.getAll(),
      f = [ ]
  
  // console.error("\nProfiles ", p)

  for (var k in p)
    if (p.hasOwnProperty(k)) {
      for( var i = 0; i < p[k].invokations.length; i++) {
        var invoked = p[k].invokations[i],
            started = invoked.get('start'),
            ended   = invoked.get('end'),
            time    = ended - started,
            insert  = 0,
            invkd   = { 
              name    : p[k].name,
              defined : p[k].file + ':' + p[k].line + ':' + p[k].column,
              invoked : invoked.get('file'),
              time    : time
            }

        for (var j = 0; j < f.length; j++)
          if (typeof f[i] !== 'undefined' && time > f[i].time)
            insert = j
        
        f.splice(insert, 0, invkd) 
      }
    }
  
  var totalExecTime = 0

  for (var i = f.length - 1; i > f.length - 20 && i >= 0; i--) {
    console.log(
      "\nname: %s (%s)\n  defined: %s\n  invoked: %s", 
      f[i].name, 
      f[i].time, 
      f[i].defined, 
      f[i].invoked)

    totalExecTime += f[i].time
  }

  console.log("\nSlowest 20 function's execution time:\n  %s microseconds\n", totalExecTime)
}

// These are both included merely for readability,
// sometime writeTo makes more sense than generate
exports.generate = summary;
exports.writeTo  = summary;