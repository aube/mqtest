var gulp = require('gulp');
var browserSync = require('browser-sync');
var $ = require('gulp-load-plugins')();
var CONFIG = require('../config');

var argv = require('yargs').argv,
    PRODUCTION = argv.production,
    MAPS = argv.maps;


function string_src(filename, string) {
    var src = require('stream').Readable({ objectMode: true })
    src._read = function () {
        this.push(new $.util.File({
            cwd: "",
            base: "",
            path: filename,
            contents: new Buffer(string)
        }))
        this.push(null)
    }
    return src
}


gulp.task('scripts', function() {
    var pipe = gulp.src(CONFIG.js.src)
        .pipe($.plumber())
        .pipe($.replace('%VERSION%', CONFIG.version));

    if (MAPS) {
        pipe = pipe.pipe($.sourcemaps.init())
    } else {
        //cleanup maps:
        string_src(CONFIG.js.concat + '.map', '')
            .pipe(gulp.dest(CONFIG.js.dest));
    }

    if (PRODUCTION)
        pipe = pipe.pipe($.concat(CONFIG.js.concat))
            .pipe($.uglify());

    if (MAPS) {
        pipe = pipe.pipe($.sourcemaps.write('.'));
    }

    return pipe.pipe(gulp.dest(CONFIG.js.dest));
});
