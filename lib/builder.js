/**
 * Created by jianlin.zjl on 15-4-15.
 */
var util = require('util');
var fs = require('fs');
var path  = require('path');
var cwdPath = process.cwd();
var spawn = require('ginit').spawn;
module.exports = function (obj,cb) {
  obj = obj || {};
  cb = cb || function(){};
  var tasks = util.isString(obj.tasks) ? [obj.tasks] : obj.tasks;
  var args = [];
  args.unshift(path.join(__dirname, '../node_modules/gulp/bin/gulp'));
  args.push('--gulpfile', getBuilderFile());
  args.push('--cwd',cwdPath);
  obj.buildTo && args.push('--buildTo',obj.buildTo);
  tasks && args.push('--_',tasks); // 执行某个task
  args.push('--args',obj.args);
  args.unshift('--harmony');
  var builder =  spawn('node', args , {
    cwd: cwdPath,
    env: process.env,
    stdio: 'inherit' //输出log
  });
  builder.on('error', cb);
  builder.on('exit', function(code){
    if (code) {
      cb(new Error('build exit with code '+ code));
    } else {
      cb();
    }
  });
};

function getBuilderFile(){
  return path.join(__dirname,'../template/Gulpfile.js');
}