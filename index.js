/**
 * Created by casperd on 2/22/2016.
 */

var through = require('through2');
var gutil = require('gulp-util');
var flatten = require('flat');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-flat';

//function gulpFlat() {
//    var stream = through();
//    stream.write(flatten(file.contents));
//    return stream;
//}

// plugin level function (dealing with files)
function flattenGulp() {

    // creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, cb) {
        if (file.isBuffer()) {
            var flatJSON = new Buffer(
                JSON.stringify(
                    flatten(
                        file.contents)));
            file.contents = flatJSON;
        }

        if (file.isStream()) {

            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported! NYI'));
            return cb();
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);
        // tell the stream engine that we are done with this file
        cb();
    });

    // returning the file stream
    return stream;
}

// exporting the plugin main function
module.exports = flattenGulp;

///**
// * Created by casperd on 2/22/2016.
// */
//
//var through = require('through2');
//var gutil = require('gulp-util');
//var flatten = require('flat');
//var PluginError = gutil.PluginError;
//
//// consts
//const PLUGIN_NAME = 'gulp-flat';
//
//function gulpFlat() {
//    var stream = through();
//    stream.write(flatten(file.contents));
//    return stream;
//}
//
//// plugin level function (dealing with files)
//function flattenGulp() {
//
//    // creating a stream through which each file will pass
//    var stream = through.obj(function(file, enc, cb) {
//        if (file.isBuffer()) {
//            this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
//            return cb();
//        }
//
//        if (file.isStream()) {
//            // define the streamer that will transform the content
//            var streamer = gulpFlat();
//            // catch errors from the streamer and emit a gulp plugin error
//            streamer.on('error', this.emit.bind(this, 'error'));
//            // start the transformation
//            file.contents = file.contents.pipe(streamer);
//        }
//
//        // make sure the file goes through the next gulp plugin
//        this.push(file);
//        // tell the stream engine that we are done with this file
//        cb();
//    });
//
//    // returning the file stream
//    return stream;
//}
//
//// exporting the plugin main function
//module.exports = gulpFlat;