/**
 * Created by developer123 on 13.02.15.
 */
var gulp = require('gulp');
var argv = require('yargs').argv;
var browserify = require('browserify');
var watchify = require('watchify');
var _ = require('underscore');
var source = require('vinyl-source-stream');
var webserver = require('gulp-webserver');
var opn = require('opn');

gulp.task("browserify", function () {
    var destDir = "./js/dist";

    var bundleThis = function (srcArray) {
        _.each(srcArray, function (sourceFile) {
            var bundle = browserify("./js/src/" + sourceFile + ".js", { debug: true })
                .bundle()
                .pipe(source(sourceFile + "Bundle.js"))
                .pipe(gulp.dest(destDir));
        });
    };

    bundleThis(["login", "files","users","templates","notify"]);
});

var sourcePaths = {
    js: ['./js/actions/*.js', './js/components/*.js', './js/constants/*.js', './js/dispatcher/*.js', './js/libs/*.js', './js/src/*.js', './js/stores/*.js']
};

var server = {
    host: 'localhost',
    port: '8001'
}

gulp.task('openbrowser', function () {
    opn('http://' + server.host + ':' + server.port + '/index.html');
});

gulp.task('webserver', function () {
    gulp.src('./')
      .pipe(webserver({
          host: server.host,
          port: server.port,
          livereload: true,
          directoryListing: true
      }));
});

gulp.task('watch', function () {
    gulp.watch(sourcePaths.js, ['browserify']);
});

gulp.task('default', ['browserify', 'webserver', 'watch', 'openbrowser']);

gulp.task('debug', ['webserver', 'watch', 'openbrowser']);
