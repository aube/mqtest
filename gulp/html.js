var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var CONFIG = require('../config');
var argv = require('yargs').argv;


gulp.task('html', function() {
    var pipe = gulp.src(CONFIG.html.src)
        .pipe($.plumber());

    if (argv.production) {
        pipe = pipe.pipe($.cleanhtml());
    }

    return pipe.pipe(gulp.dest(CONFIG.html.dest));
});
