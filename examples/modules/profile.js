function doSomething(fun, cb) {
  var result = fun;
  for (var i = 0; i < 1; i++)
    console.log(result += '.');

  cb(result);
}

function ummm(result) {
  for (var i = 0; i < 1; i++)
    console.log(result += '.');
}

exports.doSomething = doSomething;
exports.callback    = ummm;