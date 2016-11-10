var pageJson = require('./package.json');
module.exports = {
  name: pageJson.name,
  viser: '@branch@', //设置版本号为当前分支
  options: {
      group: '',
  },
  script: {
    //start
    //build: ''
    //nice : true
  },
  test: function () {

  },
  publish: function () {

  },
  preBuild: function () {

  },
  preStart: function () {

  },
  postStart: function () {

  },
  appServer: function () {

  },
  postBuild: function () {

  },
  getWebpack: function () {

  }
};
