var gulp = require('gulp'),
    path = require('path'),
    less = require('gulp-less'),
    LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 4 versions", 'ie 9'] }),
    imagemin = require('gulp-imagemin');
    nunjucks = require('gulp-nunjucks-render'),
    data = require('gulp-data'),
    watch = require('gulp-watch'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    browserify = require('browserify'),
    sourceStream = require('vinyl-source-stream'),
    notify = require("gulp-notify") ;

    _ = require('underscore'),
    _.str = require('underscore.string'),
    fs = require('fs'),
    fse = require('node-fs-extra');


var src = './src/';
var build = './build/';
var store = './datastore/';

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

//copy and optimize images
gulp.task('assets', function () {
    return gulp.src(src + '/assets/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(build + 'assets'))
        .on("error", notify.onError(function (error) {
            return "Error: " + error.message;
         }))
});

//less compilation, autoprefixer and minify
gulp.task('styles', function () {
  return gulp.src(src + 'less/style.less')
    .pipe(less({
      compress: true,
      plugins: [autoprefix],
      paths: [ path.join(__dirname, 'less', 'includes') ]
    })
    .on("error", notify.onError(function (error) {
         return "Error: " + error.message;
     })))
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
    gulp.watch([src + '*.{html,nunj}', store + '*.json', src + 'templates/*.{html,nunj}'], ['content']);
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
