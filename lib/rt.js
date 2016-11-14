/**
 * Created by zhou on 16/11/8.
 */
var fs = require('fs');
var path = require('path');
var config = {};
var util = require('util');
var ginit = require('ginit');
var spawn = ginit.spawn;
var cwd = process.cwd();
var configPath = path.join(cwd,'rx-config.js');
if(fs.existsSync(configPath)){
    var wrbConfig = require(configPath);
    if(util.isFunction(wrbConfig)){
        config = wrbConfig(ginit) || {};
    }else{
        config = wrbConfig || {};
    }
}
var RX = Object.assign(require('ginit'),{
    config: config,
    configPath: configPath,
    report: function () {
        return {
            log: function () {

            },
            error: function () {

            }
        }
    }(),
    doneCallback: function (fn,RT,callback) {
        callback = callback || function () {};
        RT = RT || this;
        var end = fn(RT) || {};
        if(util.isFunction(end.then)){
            end.then(function (data) {
                callback(null,data);
            },function (err) {
                callback(err || true);
            })
        }else {
            callback(null,end);
        }
    },
    //执行命令
    spawnExecCli: function (command,cb) {
        cb = cb || function () {};
        //5.6.0 支持以命令的方式执行
        var npmRun = require('npm-run-script');
        //{ stdio: 'inherit', shell: true }
        var child = npmRun(command, { stdio: 'inherit'});
        child.on('error', cb);
        child.on('exit', cb);
    },
    //获取模块
    getRequire: function (str) {
        return require(str)
    }
});
module.exports = RX;