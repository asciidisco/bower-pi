#!/usr/bin/env node
'use strict';

var bowerJsonPath = 'bower.json';

// check for one of the arguments
var next;
process.argv.forEach(function (arg) {
	if (next) {
		bowerJsonPath = arg;
		if (bowerJsonPath.search('bower.json') === -1) {
			bowerJsonPath + '/bower.json';
		}
		next = false;
	}

	if (arg === '--bowerJSON') {
		next = true;
	}
});

require('../index.js')(bowerJsonPath);
