/**
 * @file build.js
 * @author test
 */

const argv = require('yargs-parser')(process.argv.slice(2));

const build = require('okam-build');
build.run('swan', require('./swan.config'), argv);
