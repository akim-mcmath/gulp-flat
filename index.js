'use strict';

var inherits = require('util').inherits;
var Transform = require('stream').Transform;
var PluginError = require('gulp-util').PluginError;
var flatten = require('flat');

/**
 * Main plugin function. In addition to the options below, any option available
 * to the flat npm package may be passed. See https://www.npmjs.com/package/flat
 *
 * @param {object} opts - An options object.
 * @param {boolean} opts.pretty - Prettifies the output if true.
 * @returns {Transform} A Node.js Transform stream.
 */
function gulpFlat(opts) {
  if (opts && !/object|function/.test(typeof opts)) {
    throwPluginError('opts must be an object or undefined');
  }
  return new GulpFlatStream(opts);
}

// Stream returned by main plugin function.
function GulpFlatStream(opts) {
  Transform.call(this, {objectMode: true});
  this.opts = opts || {};
}

inherits(GulpFlatStream, Transform);

GulpFlatStream.prototype._transform = function(file, enc, next) {
  if (file.isBuffer()) {
    file.contents = flattenContents(file.contents, this.opts);
  }

  if (file.isStream()) {
    file.contents = file.contents.pipe(new FlattenContentsStream(this.opts));
  }

  next(null, file);
};

// Stream to pipe contents to if File is in streaming mode.
function FlattenContentsStream(opts) {
  Transform.call(this);
  this.opts = opts;
  this.data = [];
}

inherits(FlattenContentsStream, Transform);

FlattenContentsStream.prototype._transform = function(chunk, enc, next) {
  this.data.push(chunk);
  next();
};

FlattenContentsStream.prototype._flush = function(done) {
  var contents = Buffer.concat(this.data);
  this.push(flattenContents(contents, this.opts));
  done();
};

// Takes a Buffer and an options object, and returns a flattened JSON Buffer.
function flattenContents(contents, opts) {
  var flatJson = flatten(JSON.parse(contents), opts);
  var flatString = JSON.stringify(flatJson, null, opts.pretty ? 2 : null);
  return new Buffer(flatString);
}

// Helper function to throw PluginError if user input is incorrect.
function throwPluginError(message) {
  throw new PluginError('gulp-flat', message);
}

// Export main plugin function.
module.exports = gulpFlat;
