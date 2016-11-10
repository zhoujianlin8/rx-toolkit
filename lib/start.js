/**
 * Created by jianlin.zjl on 15-4-16.
 */
var util = require('util');
var cwdPath = process.cwd();
var path = require('path');
var RT = require('./rt');
var spawn = RT.spawn;
var fs= require('fs');
module.exports = function(options,cb){
  options = util._extend({

  },options||{});
  cb = cb || function(){};
  var args = [];
  args.push(getServerFile());
  options.port && args.push('--port',options.port);
  args.push('--args',options.args);
  var server;
  start();
  //改变配置自动重启
  fs.watchFile(RT.configPath, function (event, filename) {
    restart();
  });

  function start(arr){
    var arr = args.concat(arr || []);
    server = spawn('node', arr , {
      cwd: cwdPath,
      env:  process.env,
      stdio: 'inherit' //输出log
    });
    server.on('error', cb);
    server.on('exit', function(code){
      if (code) {
        cb(new Error('start exit with code '+ code));
      } else {
        cb();
      }
    });
  }
  function restart() {
    server.kill();
    console.log('Server stopped');
    start(['--open',false]);
    console.log('Server started');
  }

  //捕获异常重启
  process.on('uncaughtException', function(err) {
    console.log('uncaughtException: ' + err && err.message);
    !isRestartAgain() && restart();
  });

  var timer = null;
  function isRestartAgain() {
    var b = false;
    if(timer){
      b = true;
    }
    timer = setTimeout(function () {
      timer = null;
    },2000);
    return b
  }
};

function getServerFile(){
  return path.join(__dirname,'./server.js');
}
