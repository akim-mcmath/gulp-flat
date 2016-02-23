'use strict';

var readFileSync = require('fs').readFileSync;
var resolve = require('path').resolve;
var expect = require('chai').expect;
var gutil = require('gulp-util');
var es = require('event-stream');

describe('plugin:gulp-flat', function() {

  var gulpFlat, mockJson, expectedJson;
  before('require plugin', function() {
    gulpFlat = require('../index');
    mockJson = readFileSync(resolve(__dirname, 'fixtures/mock.json'));
    expectedJson = readFileSync(resolve(__dirname, './fixtures/expected.json'));
  });

  it('is the main module', function() {
    expect(gulpFlat).to.equal(require('..'));
  });

  it('exports gulpFlat()', function() {
    expect(gulpFlat).to.be.instanceof(Function);
    expect(gulpFlat).to.have.property('name', 'gulpFlat');
  });

  describe('param:options', function() {

    var file;
    beforeEach('mock file', function() {
      file = new gutil.File({
        path: 'some/path/to/mock.json',
        contents: mockJson
      });
    });

    it('throws PluginError if a truthy non-object is passed', function() {
      expect(gulpFlat.bind(null, 42)).to.throw(gutil.PluginError);
    });

    it('accepts options available to the flat npm package', function() {
      var match = /"object%an"/;
      gulpFlat({delimiter: '%'}).write(file);
      expect(file.contents).to.match(match);
    });

    describe('option:pretty', function() {
      it('prettifies the output with indent of 2 if truthy', function() {
        var match = / "string": "this is a string",\n  "boolean"/;
        gulpFlat({pretty: true}).write(file);
        expect(file).property('contents').to.match(match);
      });

      it('does not prettify the output if flasy', function() {
        var match = /"string":"this is a string","boolean"/;
        gulpFlat().write(file);
        expect(file).property('contents').to.match(match);
      });
    });
  });

  describe('mode:buffer', function() {

    var file;
    beforeEach('run through plugin', function() {
      file = new gutil.File({
        path: 'some/path/to/mock.json',
        contents: mockJson
      });
      gulpFlat().write(file);
    });

    it('returns a stream of Vinyl files', function() {
      expect(gutil.File.isVinyl(file)).to.be.true;
    });

    it('files are in buffer mode', function() {
      expect(file.isBuffer()).to.be.true;
    });

    it('flattens JSON file contents', function() {
      expect(file).property('contents').to.deep.equal(expectedJson);
    });
  });

  describe('mode:streaming', function() {

    var file;
    beforeEach('run through plugin', function(done) {
      gulpFlat().once('data', function(_file) {
        file = _file;
        done();
      }).write(new gutil.File({
        path: 'some/path/to/mock.json',
        contents: es.readArray(mockJson.toString().split(/(,)/g))
      }));
    });

    it('returns a stream of Vinyl files', function() {
      expect(gutil.File.isVinyl(file)).to.be.true;
    });

    it('files are in buffer mode', function() {
      expect(file.isStream()).to.be.true;
    });

    it('flattens JSON file contents', function(done) {
      file.pipe(es.wait(function(err, data) {
        expect(data).to.deep.equal(expectedJson);
        done();
      }));
    });
  });
});
