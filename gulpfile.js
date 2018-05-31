var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    argv = require('yargs').argv,
    $ = require('gulp-load-plugins')();

var CONFIG = require('./config'),
    PRODUCTION = argv.production,
    MAPS = argv.maps;



require('./gulp/sass.js');
require('./gulp/scripts.js');
require('./gulp/html.js');
require('./gulp/sprites.js');



gulp.task('cleanup-build', function() {
    return gulp.src([
        CONFIG.js.dest,
        CONFIG.css.dest,
        CONFIG.html.dest + '/index.html'
    ]).pipe($.clean());
});



gulp.task('default', ['cleanup-build', 'sprite'], function() {
    gulp.start('watch');

    browserSync.init(null, {
        port: CONFIG.server.port + 80,
        open: false,
        reloadDelay: 1000,
        // server: {
        //  baseDir: "./build",
        // },
        // notify: false,
        // logConnections: false,
        proxy: 'localhost:' + CONFIG.server.port
    });

    $.nodemon({
        script: CONFIG.server.exec,
        ext: 'js',
        // watch: [CONFIG.server.dir + '/**/*.js', CONFIG.server.dir + '/**/*.jade', CONFIG.server.exec],
        // ignore: ['ignored.js'],
        // tasks: ['lint']
    })
    .on('start', function () {
        browserSync.reload();
    })
});



gulp.task('inject', ['scripts', 'html', 'scss'], function() {
    var css = gulp.src([CONFIG.css.dest + '/**/*.css'], {read: false}),
        js = gulp.src([CONFIG.js.dest + '/**/*.js'], {read: false}),
        pipeIndex = gulp.src(CONFIG.html.index);

    pipeIndex = pipeIndex
        .pipe($.inject(css, {ignorePath: 'build'}))
        // .pipe($.inject(app, {ignorePath: 'build', starttag: '<!-- inject:app:{{ext}} -->'}))
        .pipe($.inject(js, {ignorePath: 'build'}));

    if (PRODUCTION) {
        pipeIndex = pipeIndex.pipe($.cleanhtml())
            .pipe($.replace(/(\/js\/main\.\d\.\d\.\d\.min\.js)/gm,'$1?' + Date.now().toString(16).substr(7)))
            // .pipe($.replace(/(\/app\/app\.\d\.\d\.\d\.min\.js)/gm,'$1?' + Date.now().toString(16).substr(7)))
            .pipe($.replace(/(\/css\/style\.\d\.\d\.\d\.min\.css)/gm,'$1?' + Date.now().toString(16).substr(7)))
    }

    return pipeIndex.pipe(
        gulp.dest(CONFIG.html.dest)
    );
});



gulp.task('scss-reload', ['scss'], function() {
    gulp.src(CONFIG.css.dest + '/**/*.css')
        .pipe(browserSync.stream());
});

gulp.task('scripts-reload', ['scripts'], function() {
    // browserSync.stream();
    browserSync.reload();
});

gulp.task('html-reload', ['html'], function() {
    // browserSync.stream();
    browserSync.reload();
});

gulp.task('inject-reload', ['inject'], function() {
    browserSync.reload();
});


gulp.task('watch', ['inject'], function() {

    //index
    gulp.watch([
        CONFIG.html.index
    ], ['inject-reload']);

    //scss
    gulp.watch([
        CONFIG.css.src
    ], function(event) {
        if (event.type === 'changed') {
            gulp.start('scss-reload');
        } else {
            gulp.start('inject-reload');
        }
    });

    //js
    gulp.watch([
        CONFIG.js.src
    ], function(event) {
        if (event.type === 'changed') {
            gulp.start('scripts-reload');
        } else {
            gulp.start('inject-reload');
        }
    });

    //html
    gulp.watch([
        CONFIG.html.src,
        '!' + CONFIG.html.index
    ], function(event) {
        gulp.start('html-reload');
    });

});
