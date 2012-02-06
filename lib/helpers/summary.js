var profiles = require('../collections/profiles'),
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

        f.push(invkd)
      }
    }

  f.sort(function (a, b) {
    if (a.time === b.time) return 0;
    if (a.time < b.time) return 1;
    return -1;
  });
  
  begin()

  var totalExecTime = 0

  for (var i = 0; i <= 20; i++) {
    console.log(
      "\nname: %s (%s)\n  defined: %s\n  invoked: %s", 
      f[i].name, 
      f[i].time, 
      f[i].defined, 
      f[i].invoked)

    totalExecTime += (f[i].time >= 0 ? f[i].time : 0)
  }

  done()

  console.log("\nSlowest 20 function's execution time:\n  %s microseconds\n", totalExecTime)
}

// These are both included merely for readability,
// sometime writeTo makes more sense than generate
exports.generate = summary;
exports.writeTo  = summary;