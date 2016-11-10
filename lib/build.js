/**
 * Created by jianlin.zjl on 15-4-15.
 */
var util = require('util');
var fs = require('fs');
var path  = require('path');
var cwdPath = process.cwd();
var RT = require('./rt');
var lib = require('./index');
var config = RT.config;
module.exports = function (obj,cb) {
  RT.env = 'build';
  var options = {};
  lib.configPathExists();
  var webpackConfig = lib.getWebpackConfig(options);
  doArrDone([copy,doWebpack,addBuild]);
  function addBuild(callback){
    if(util.isFunction(config.addBuild)){
      RT.doneCallback(config.addBuild,RT,callback)
    }else{
      callback();
    }
  }
  function copy(callback) {
    callback();
  }
  function doWebpack(callback) {
    webpackConfig.then(function (config) {
      callback();
    })
  }

  function doArrDone(arr) {
    var len = arr.length;
    arr.forEach(function (item) {
      item(done)
    });
    var index = 0;
    function done() {
      index ++ ;
      if(index >= len){
        cb && cb();
      }
    }
  }
};
