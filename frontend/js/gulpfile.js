/**
 * Created by developer123 on 13.02.15.
 */
var gulp = require('gulp');
var argv = require('yargs').argv;
var browserify = require('browserify');
var _ = require('underscore');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

gulp.task("build", function () {
    return bundle = browserify(["./src/generic.js"])
        .bundle()
        .pipe(source("genericBundle.js"))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task("browserify", function () {
    return bundle = browserify(["./src/generic.js"])
        .bundle()
        .pipe(source("genericBundle.js"))
        .pipe(gulp.dest('./dist'));
});