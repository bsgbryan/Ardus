var ardus    = require('../lib/ardus'),
    required = ardus.require('fs');

required.fs.readFile(__dirname + '/demo.js', function fileContents (err, data) {
  console.log(data);
});

process.on('exit', function () {
	ardus.helper('summary').generate();
});