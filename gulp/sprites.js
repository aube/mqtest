var gulp = require('gulp');
var browserSync = require('browser-sync');
var $ = require('gulp-load-plugins')();
var config = require('../config');
var argv = require('yargs').argv;

var production = argv.production;
var makeMaps = argv.maps;
var rename = require('gulp-rename');


gulp.task('sprite', function () {

    //TODO: checkup paths, variables and write this into config.js
    return;


    var svgFile ='sprite.' + config.version + '.svg';

    return gulp.src('./src/images/svg/**/*.svg')
        // minify svg
        .pipe($.svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe($.replace('fill="#000"', ''))
        .pipe($.replace('fill="#000000"', ''))
        .pipe($.replace('fill:#000000', ''))

        .pipe($.svgSprite({
            mode: {
                symbol: {
                    sprite: '../../../assets/images/' + svgFile,
                    render: {
                        scss: {
                            dest:'../sprites/sprite.scss',
                            template: './src/scss/sprites/sprite.scss.tpl'
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest('./src/scss'));
});




