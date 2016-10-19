/// <binding BeforeBuild='default' />
'use strict';

var gulp = require('gulp'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    tsify = require('tsify'),
    pretty = require('prettysize'),
    merge = require('lodash.merge'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    stream = require('stream'),
    gulpWatch = require('gulp-watch'),
    del = require('del'),
    runSequence = require('run-sequence'),
    argv = process.argv;

var gutil = require('gulp-util');
var server = require('gulp-server-livereload');
// var ts = require('gulp-typescript');

// var tsProject = ts.createProject('tsconfig.json');
var options = {
   watch: false,
  src: ['./game/app.ts', './typings/index.d.ts'],
  outputPath: 'www/build',
  outputFile: 'app.js',
  minify: false,
  browserifyOptions: {
    cache: {},
    packageCache: {},
    debug: true
  },
  watchifyOptions: {},
  tsifyOptions: {},
  uglifyOptions: {},
  onError: function(err){
    console.error(err.toString());
    this.emit('end');
  },
  onLog: function(log){
    console.log((log = log.split(' '), log[0] = pretty(log[0]), log.join(' ')));
  }
};

options.jsSrc = [
  'node_modules/es6-shim/es6-shim.min.js',
  'node_modules/es6-shim/es6-shim.map',
  'merges/browser/scripts/platformOverrides.js',
  'merges/browser/scripts/phaser.min.js'
];

options.assetSrc = 'res/release/**/*';
options.jsDest = 'www/scripts';
options.assetDest = 'www/build/assets';
options.lint = {
  src: 'game/**/*.ts',
  tslintOptions: {
    configuration: 'tslint.json'
  },
  reporter: "verbose",
  reportOptions: {}
};

var isRelease = argv.indexOf('--release') > -1;

var buildBrowserify = function(customOptions){

  options = merge(options, customOptions);
  var b = browserify(options.src, options.browserifyOptions)
    .plugin(tsify, options.tsifyOptions);
    
  if (options.watch) {
    b = watchify(b, options.watchifyOptions);
    b.on('update', bundle);
    b.on('log', options.onLog);
  }

  return bundle();

  function bundle() {
    var debug = options.browserifyOptions.debug;

    return b.bundle()
      .on('error', options.onError)
      .pipe(source(options.outputFile))
      .pipe(buffer())
      .pipe(debug ? sourcemaps.init({ loadMaps: true }) : noop())
      .pipe(options.minify ? uglify(options.uglifyOptions) : noop())
      .pipe(debug ? sourcemaps.write('./',{includeContent:true, sourceRoot:'../../../'}) : noop())
      .pipe(gulp.dest(options.outputPath));
  }

  function noop(){
    return new stream.PassThrough({ objectMode: true });
  }
};

gulp.task('scripts', function(){
  return gulp.src(options.jsSrc).pipe(gulp.dest(options.jsDest));
});
gulp.task('assets',  function(){
  return gulp.src([options.assetSrc]).pipe(gulp.dest(options.assetDest));
});

gulp.task('clean', function(){
  return del('www/build');
});
gulp.task('lint', function(){
  return gulp.src(options.lint.src)
      .pipe(tslint(options.lint.tslintOptions))
      .pipe(tslint.report(options.lint.reporter, options.lint.reportOptions));
});

gulp.task('watch', ['clean'], function(done){
  runSequence(
    [ 'scripts','assets'],
    function(){
      //gulpWatch('game/**/*.ts', function(){ gulp.start('scripts'); });
      buildBrowserify({ watch: true }).on('end', done);
    }
  );
});

gulp.task('build', ['clean'], function(done){
  runSequence(
    ['scripts','assets'],
    function(){
      buildBrowserify({
        minify: isRelease,
        browserifyOptions: {
          debug: !isRelease
        },
        uglifyOptions: {
          mangle: false
        }
      }).on('end', done);
    }
  );
});

gulp.task('default',['watch'], function() {
    
  gulp.src('www')
    .pipe(server({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});
