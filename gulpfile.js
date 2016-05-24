'use strict';

var            gulp = require('gulp'),
            connect = require('gulp-connect'),
              watch = require('gulp-watch'),
               sass = require('gulp-sass'),
             prefix = require('gulp-autoprefixer'),
             jshint = require('gulp-jshint'),
             concat = require('gulp-concat'),
             header = require('gulp-header'),
         sourcemaps = require('gulp-sourcemaps'),
          templates = require('gulp-angular-templatecache'),
                git = require('gulp-git'),
             expect = require('gulp-expect-file'),
                 fs = require('fs');

var buildInfo; // assigned during buildInfo task with a string containing commit sha and build date

var path = {
  vendor: 'node_modules/',
  src:    'src/',
  public: 'public/',
  temp:   'temp/'
};

var files = {
  vendor: [
    path.vendor + 'lodash/lodash.min.js',
    path.vendor + 'angular/angular.min.js'
  ],
  srcJs: [
    path.src + 'js/app.module.js',
    path.src + 'js/**/*.js'
  ],
  templates: path.src + 'js/**/*.html',
  sass: path.src + 'sass/**/*.scss'
};

var localPort = 4000;
var lrPort = 35730;

gulp.task('jshint', function() {
  return gulp.src(files.srcJs)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('vendorJs', function() {
  return gulp.src(files.vendor)
    .pipe(expect({ errorOnFailure: true }, files.vendor))
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(path.public + 'js'));
});

gulp.task('appJs', ['appJs:templates', 'appJs:header'], function() {
  var srcFiles = [].concat(path.temp + 'header.js', files.srcJs, path.temp + 'templates.js');

  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.public + 'js'));
});

gulp.task('appJs:templates', function () {
  return gulp.src(files.templates)
    .pipe(templates('templates.js', { module: 'app' }))
    .pipe(gulp.dest(path.temp));
});

gulp.task('appJs:header', ['buildInfo'], function(cb) {
  fs.writeFile(path.temp + 'header.js', 'var APP_BUILD_INFO = "' + buildInfo + '";', function(err) {
    cb(err);
  });
});

gulp.task('buildInfo', function(cb) {
  git.revParse({ args: 'HEAD', quiet: true }, function(err, hash) {
    buildInfo = new Date() + ' ' + hash;
    console.log('buildInfo: ' + buildInfo);
    cb(err);
  });
});

gulp.task('sass', ['buildInfo'], function() {
  gulp.src(files.sass)
    .pipe(sass({
      outputStyle: ['compressed'],
      //sourceComments: 'normal',
      errLogToConsole: true
    }))
    .pipe(prefix({ browsers: '> 1%, last 2 versions, Firefox ESR, IE 9' }))
    .pipe(header('/* APP_BUILD_INFO - ' + buildInfo + ' */\n'))
    .pipe(gulp.dest(path.public + 'css'));
});

gulp.task('watch', ['build'], function() {
  gulp.watch(files.srcJs, ['jshint']);
  gulp.watch([].concat(files.srcJs, files.templates), ['appJs']);
  gulp.watch(files.sass, ['sass']);

  watch([path.public + '**/*.html', path.public + 'css/**/*.css'])
    .pipe(connect.reload());
});

gulp.task('server', ['build'], function() {
  console.log( '\nStarting local server at http://localhost:' + localPort + '/\n' );

  connect.server({
    root: path.public,
    port: localPort,
    livereload: { port: lrPort }
  });
});

gulp.task('build', ['sass', 'vendorJs', 'appJs']);

gulp.task('default', [ 'server', 'watch' ]);
