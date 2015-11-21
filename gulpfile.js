var gulp = require('gulp'),
    gutil = require('gulp-util'),
    path = require('path');
    dirSync = require( 'gulp-directory-sync' ),
    less = require('gulp-less'),
    nunjucks = require('gulp-nunjucks-render'),
    data = require('gulp-data'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    browserify = require('browserify'),
    sourceStream = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    _ = require('underscore'),
    _.str = require('underscore.string'),
    fs = require('fs'),
    fse = require('node-fs-extra'),
    monocle = require('monocle')()


var src = './src/';
var build = './build/';
var store = './datastore/';

// watch all kinds off events occuring in assets dir (new, update, delete, rename)
monocle.watchDirectory({
  root: src + 'assets/',
  listener: function(obj) {
    gulp.start('assets')
  },
  complete: function() { console.log('done')}
});

//  Lauch options
gulp.task('default', ['watch']);
gulp.task('watch', ['content', 'assets', 'styles', 'scripts', 'watchers', 'server']);
gulp.task('build', ['content', 'assets', 'styles', 'scripts']);

gulp.task('content', function () {
    nunjucks.nunjucks.configure([src]);
    return gulp.src(src + '*.html')
        .pipe(data(getDataForFile))
        .pipe(nunjucks())
        .pipe(gulp.dest(build))
        .pipe(livereload());
});

gulp.task('assets', function() {
    return gulp.src(src + 'assets/')
      .pipe(dirSync(
        src + 'assets/', build + '/assets/', { printSummary: true } )
      )
      .on('error', gutil.log);
  })

// Compile less
gulp.task('styles', function () {
    gulp.src(src + 'less/style.less')
        .pipe(less()) // Compile LESS
        .pipe(gulp.dest(build + 'css'))
        .pipe(livereload());
});

// Concat dependencies and copy resouces files
gulp.task('scripts', function() {
    var bundleStream = browserify()
        .add(src + 'js/app.js')
        .transform(require('browserify-css'), {
            rootDir: '.',
            processRelativeUrl: function(relativeUrl) {
                var stripQueryStringAndHashFromPath = function(url) {
                    return url.split('?')[0].split('#')[0];
                };
                var rootDir = path.resolve(process.cwd(), '.');
                var relativePath = stripQueryStringAndHashFromPath(relativeUrl);
                var queryStringAndHash = relativeUrl.substring(relativePath.length);

                //
                // Copying files from '../node_modules/**' to 'dist/vendor/**'
                //
                var prefix = 'node_modules/';
                if (_.str.startsWith(relativePath, prefix)) {
                    var vendorPath = 'vendor/' + relativePath.substring(prefix.length);
                    var source = path.join(rootDir, relativePath);
                    var target = path.join(rootDir, build + vendorPath);

                    // gutil.log('Copying file from ' + JSON.stringify(source) + ' to ' + JSON.stringify(target));
                    fse.copySync(source, target);

                    // Returns a new path string with original query string and hash fragments
                    return vendorPath + queryStringAndHash;
                }

                return relativeUrl;
            }
        })
        .bundle();

    bundleStream
        .pipe(sourceStream('app.js'))
        .pipe(gulp.dest(build + 'js'))
        .pipe(livereload());
});

// Trigger tasks when file is touched
gulp.task('watchers', function () {
    livereload.listen();
    gulp.watch([src + '*.{html,nunj}', store + '*.json'], ['content']);
    gulp.watch([src + 'less/*.less'], ['styles']);
    gulp.watch([src + 'js/*.{js,css}'], ['scripts']);
});

// Local server to preview result
gulp.task('server', function() {
    connect.server({
        host: '127.0.0.1',
        port: 8888,
        root: build,
        livereload: true
    });
});

// Load custom data for templates
function getDataForFile(file){
    var globals = null;
    var globals_json = store + 'globals.json';
    if(fs.existsSync(globals_json)) {
        globals = JSON.parse(fs.readFileSync(globals_json, "utf8"));
    }

    var context = null
    var context_json = store + path.basename(file.path.replace('.html', '.json'));
    if(fs.existsSync(context_json)) {
        context = JSON.parse(fs.readFileSync(context_json, "utf8"));
    }

    return {
        globals: globals,
        context: context,
        file: file
    };
}
