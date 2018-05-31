var gulp = require('gulp');
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



gulp.task('scss', function() {
    var pipe = gulp.src(CONFIG.css.src)
        .pipe($.plumber())

    if (MAPS) {
        pipe = pipe.pipe($.sourcemaps.init())
    } else {
        //cleanup maps:
        string_src(CONFIG.css.concat + '.map', '')
            .pipe(gulp.dest(CONFIG.css.dest));
    }

    if (PRODUCTION) {
        pipe = pipe
            .pipe($.sass({
                    sourceComments: false,
                    outputStyle: 'compressed',
                    errLogToConsole: true
                }).on('error', $.sass.logError))
            .pipe($.autoprefixer(CONFIG.css.prefixes))
            .pipe($.concat(CONFIG.css.concat))
            .pipe($.cleanCss());

    } else {
        pipe = pipe.pipe($.sass({
                    sourceComments: false,
                    errLogToConsole: true
                }).on('error', $.sass.logError))
            .pipe($.autoprefixer(CONFIG.css.prefixes))
    }

    if (MAPS) {
        pipe = pipe.pipe($.sourcemaps.write('.'));
    }

        return pipe.pipe(gulp.dest(CONFIG.css.dest));
});

