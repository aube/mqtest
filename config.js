var version = '0.0.1';

module.exports = {
    version: version,
    server: {
        exec: 'server.js',
        port: 5000
    },
    js: {
        src: [
            './src/js/**/*.js'
        ],
        dest: './build/js',
        concat: 'main.' + version + '.min.js'
    },
    css: {
        src: [
            './src/scss/**/*.scss'
        ],
        dest: './build/css',
        concat: 'style.' + version + '.min.css',
        prefixes: ['last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
    },
    html: {
        src: './src/**/*.html',
        index: './src/index.html',
        dest: './build'
    }
}
