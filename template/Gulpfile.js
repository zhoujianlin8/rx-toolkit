var gulp = require('gulp');
var fs = require('fs');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-clean-css');
var util = require('util');
var gUtil = require('gulp-util');
var gWebpack = require('webpack-stream');
var path = require('path');
var ctoolHtmlCompile = require('ctool-html-compile').gulp;
var argv = require('minimist')(process.argv.slice(2));
var webpack = require('webpack');
var lib = require('../lib/index');

//============ Options ==========//
try {
  var abc = fs.existsSync('abc.json') ? JSON.parse(fs.readFileSync('abc.json', 'utf8')) : {};
  abc.options = abc.options || {};
} catch(e) {
  gUtil.log('Error parse "rt-config.js"');
  process.exit(1);
}

var options = {
  minify: true,
  buildTo: 'build',
  srcBase: 'src',
  isMinify: true,
  isIgnoreIndex: true,
  isBuild: true
};
 options = util._extend(options,abc.options);
 options = util._extend(options,argv || {});
var cwdPath = process.cwd();
var srcBase = options.srcBase;
var absSrc = path.join(cwdPath,srcBase);
var BUILD_BASE = options.buildTo ;
var isSinglePage = abc.isSinglePage && abc.isSinglePage !== 'false';
options.isSinglePage = isSinglePage;
options.isCom = abc.isCom;
var lessOptions = util._extend(lib.getLessConfig(options), options.less || {});
var globOptions = {
  cwd: srcBase,
  base: srcBase
};
var uglifyOptions = {
  outSourceMap: false,
  output: {
    ascii_only: true
  }
};

var minifyCSSOptions = util._extend({
  keepBreaks: true,
  compatibility: true,
  noAdvanced: true
},options.minifyCSS || {});

var htmlOptions = util._extend({
  name: abc.name || '',
  group: abc.group || '',
  version: abc.version || '',
  transform: function (content, self) {
    var appReg = '([\'"]+)\\s?\\/' + srcBase + '\\/';
    var replacePath = htmlOptions.replacePath || '//g.assets.daily.taobao.net/' + abc.group + '/' + abc.name + '/' + self.getVersion(abc.version) + '/';
    content = content.replace(/(['"=\s])http(s)?:/g,function(world,$1){
      return $1
    });
    return content.replace(new RegExp(appReg, 'g'), function (world, $1) {
      return $1 + replacePath
    })
  }
});


options.isBuild = true;
var webpackOption = lib.getWebpackConfig(options,abc);
gulp.task('clean', function () {
  return gulp.
    src(BUILD_BASE, {read: false}).
    pipe(clean());
});

gulp.task('copy', ['clean'], function () {
  return gulp.src(['**/*.eot', '**/*.svg', '**/*.ttf', '**/*.woff', 'images/**','static/**'], globOptions)
    .pipe(gulp.dest(BUILD_BASE));
});

gulp.task('css', ['clean'], function () {
  // copy css
  return gulp
    .src(['p/*/*.css', 'index.css', 'main.css','minifys/**/*.css'], globOptions)
    .pipe(minifyCSS(minifyCSSOptions))
    .pipe(gulp.dest(BUILD_BASE));
});

gulp.task('less', ['css'], function(){
  // compile less
  return gulp
    .src(['p/*/*.less', 'index.less', 'main.less','minifys/**/*.less'], globOptions)
    .pipe(less(lessOptions))
    .pipe(options.isMinify?minifyCSS(minifyCSSOptions):gUtil.noop())
    .pipe(gulp.dest(BUILD_BASE));
});

gulp.task('minifyjs', ['clean'], function () {
  return gulp.src(['minifys/**/*.js'], globOptions)
    .pipe(options.isMinify ? uglify(uglifyOptions) : gUtil.noop())
    .pipe(gulp.dest(BUILD_BASE))
});


gulp.task('script', ['clean'], function () {
  return gulp.src([], globOptions)
    .pipe(gWebpack(webpackOption))
    // .pipe(options.isMinify ? uglify(uglifyOptions) : gUtil.noop())
    .pipe(gulp.dest(BUILD_BASE))
});
gulp.task('html', ['clean'], function () {
  return gulp.src(['p/*/*.html', '!p/*/*.jst.html', '!p/*/*.xtpl.html', '*.html','!*.jst.html','!.xtpl.html'], globOptions)
    .pipe(ctoolHtmlCompile(htmlOptions))
    //去除index后缀;
    .pipe(options.isIgnoreIndex ?rename(function (path) {
      var dirname = path.dirname;
      if (dirname && path.basename === 'index' && /[\/]/g.test(dirname)) {
        var arr = dirname.split(/[\/]/g);
        var i = arr.length - 1;
        path.basename = arr[i];
        path.dirname = arr.splice(0, i).join('/');
      }
    }):gUtil.noop())
    .pipe(gulp.dest(BUILD_BASE))
});

gulp.task('demojs', ['clean'], function () {
  var newWebpackOption = util._extend(webpackOption,{plugins: lib.getPlugins(options.webpack || {},options)});
  return gulp.src(['*.js','*.jsx'], {
    cwd: 'demo',
    base: 'demo'
  })
    .pipe(gWebpack(newWebpackOption))
    //确保添加前缀demo-;
    .pipe(rename(function (path) {
      var basename = path.basename;
      path.basename = 'demo-' + basename.replace(/^demo-/, '');
    }))
    .pipe(gulp.dest(BUILD_BASE))
});
gulp.task('cdnjs', ['clean','demojs'], function () {
  options.isCDN = true;
  var newWebpackOption = util._extend(webpackOption,lib.getWebpackConfig(options,fie.globby));
  return gulp.src(['*.js','*.jsx'])
    .pipe(gWebpack(newWebpackOption))
    .pipe(gulp.dest(BUILD_BASE))
});
gulp.task('demoless', ['clean'], function () {
  return gulp.src(['*.less'], {
    cwd: 'demo',
    base: 'demo'
  })
    .pipe(less(lessOptions))
    //确保添加前缀demo-;
    .pipe(rename(function (path) {
      var basename = path.basename;
      path.basename = 'demo-' + basename.replace(/^demo-/, '');
    }))
    .pipe(gulp.dest(BUILD_BASE))
});
gulp.task('cdnless', ['clean'], function () {
  return gulp.src(['*.less'])
    .pipe(less(lessOptions))
    .pipe(minifyCSS(minifyCSSOptions))

    .pipe(gulp.dest(BUILD_BASE))
});
gulp.task('cdncss', ['clean'], function () {
  return gulp.src(['*.css'])
    .pipe(minifyCSS(minifyCSSOptions))
    .pipe(gulp.dest(BUILD_BASE))
});

var arrBuild = ['clean', 'html', 'script', 'less', 'css', 'copy','minifyjs'];
if(abc.isCom === true || abc.isCom === 'true'){
  arrBuild = ['clean','cdncss','cdnless','demoless','demojs','cdnjs', 'copy'];
}
gulp.task('build', arrBuild);