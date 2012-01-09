require('./modules/demo')('life', 'the universe', 'everything');

process.on('exit', function () {
	require('../lib/ardus').helper('summary').generate();
});