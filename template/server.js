/**
 * Created by jianlin.zjl on 15-4-30.
 */
var util = require('util');
var fs = require('fs');
var koa = require('koa');
var logger = require('koa-morgan').middleware;
var http = require('http');
var path = require('path');
var serverIndex = require('koa-serve-index');
var rimraf = require('ginit').rimraf;
var os = require('os');
var open = require('open');
var serve = require('koa-static');
var less = require('koa-less-middleware');
var url = require('url');

var webpackMiddleware = require("koa-webpack-dev-middleware");
var ctoolHtmlMiddleware = require('ctool-html-compile').middleware;
var webpack = require('webpack');
var spawn = require('child_process').spawn;
var argv = require('minimist')(process.argv.slice(2));
var cwdPath = process.cwd();
var abcPath = path.join(cwdPath,'abc.json');
var htmlList = require('html-list-middleware');
var lib = require('../lib/index');

var abc = {};
if(fs.existsSync(abcPath)){
  abc = JSON.parse(fs.readFileSync(abcPath, {encoding: 'utf8'})) || {};
  if(!abc.options){
    console.log('abc.json 内容格式不对请调整');
    process.exit(1);
  }
}else{
  console.log('未找到abc.json cwd目录可能有问题');
  process.exit(1);
}

var options = util._extend({
  base: cwdPath,
  port: 9000,
  open: true,
  notStart: false,
  tmpDir: os.tmpdir(),
  srcBase: 'src',
  debug: false,
  isHot: true,
  isDataProxy: true,
  isWeinre: false,
}, abc.options || {});
options = util._extend(options,argv);
var isSinglePage = abc.isSinglePage && abc.isSinglePage !== 'false';
options.isSinglePage = isSinglePage;

var baseSrc = path.join(cwdPath, options.srcBase);
var tmpPath = options.tmpDir;

var app = koa();

//清除临时文件
process.nextTick(function () {
  rimraf.sync(tmpPath);
});

if (options.isDataProxy) {
  app.use(require('koa-data-proxy')(options.dataProxy || {}));
}
//favicon
//app.use(favicon(path.join(__dirname ,'../favicon.ico')));


//资源文件列表
app.use(serverIndex(
  options.base, {'icons': true}
));

//index.html显示 html list
app.use(htmlList(
 
));

//请求资源log
app.use(logger('dev'));

var proxyObj = {
  proxyName: '/WRT_pac',
  port: options.port,
  host: lib.getIPAddress(),
  rules: abc.proxyRules || []
};
//pac 代理
if(options.isProxy){
  var pacMiddleware = require('koa-pac-middleware');
  app.use(pacMiddleware(proxyObj));
}


//less
app.use(less(cwdPath, util._extend({
    debug: false,
    compress: false,
    sourceMap: false,
  },lib.getLessConfig(options),options.less || {})
));

options.isServer = true;
var webpackOption = lib.getWebpackConfig(options,abc);
var compiler = webpack(webpackOption);
app.use(webpackMiddleware(compiler,{
  noInfo: options.isHot
}));

// Step 3: Attach the hot middleware to the compiler & the server
if(options.isHot){
  app.use(require("koa-webpack-hot-middleware")(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }));
}
//开启weinre调试
if (options.isWeinre) {
    app.use(require('koa-weinre')({
        boundHost: lib.getIPAddress()
    }));
}


//处理 html
app.use(ctoolHtmlMiddleware(cwdPath, {
  name: abc.name || '',
  group: abc.group || '',
  version: abc.version || '',
  transform:  function(content){
    var reg = '([\'"]+)\\s?\\/'+options.srcBase+'\\/';
    var ip = lib.getIPAddress();
    content = content.replace(/(['"=\s])http(s)?:/g,function(world,$1){
      return $1
    });
    return content.replace(new RegExp(reg,'g'),function(world,$1){
      return $1 + '//'+ip+':'+options.port+'/'+options.srcBase+'/';
    }).replace(/(['"])([^'"]*)\/bower_components\//g,function(word,$1,$2){
      return $1+'//'+ip+':'+options.port+($2 ||'')+'/bower_components/';
    }).replace(/(['"])([^'"]*)\/node_modules\//g,function(word,$1,$2){
      return $1+'//'+ip+':'+options.port+($2 ||'')+'/node_modules/';
    })
  }
}));

//代理
app.use(serve(tmpPath));
app.use(serve(cwdPath));



var server = app.listen(options.port, function () {
  if (options.open === true) {
    open('http://127.0.0.1:' + options.port + '/index.html');
  } else if (typeof options.open === 'object') {
    options.open.target = options.open.target || target;
    options.open.appName = options.open.appName || null;
    options.open.callback = options.open.callback || function () {
    };
    open(options.open.target, options.open.appName, options.open.callback);
  } else if (typeof options.open === 'string') {
    open(options.open);
  }
  console.log('start listening on port ' + server.address().port);
});

//捕获异常
process.on('uncaughtException', function(err) {
  console.log('uncaughtException: ' + err.message);
  server.on('request', function (req, res) {
    // Let http server set `Connection: close` header, and close the current request socket.
    req.shouldKeepAlive = false;
    res.shouldKeepAlive = false;
    if (!res._header) {
      res.setHeader('Connection', 'close');
    }
  });
});




