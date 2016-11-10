var util = require('util');
var path = require('path');
var fs = require('fs');
var xtUtil = require('ginit');
var ginit = xtUtil.init;
var template = xtUtil.template;
var cwdPath = process.cwd();
var _ = xtUtil.underscore;
var templatePath = path.join(__dirname, './template');
var spawn = xtUtil.spawn;
var rewrite = xtUtil.rewrite;
var RT  = require('./lib/rt');
var abc = RT.config;
var options = util._extend({
  srcBase: 'src'
}, abc.options || {});
var isPc = abc.isPc && abc.isPc !== 'false';
var isSinglePage =  abc.isSinglePage && abc.isSinglePage !== 'false';

var srcBase = path.join(cwdPath, options.srcBase);
var Tasks = module.exports;

//项目初始化
Tasks.init = function (str) {
  if (fs.existsSync(RT.configPath)) {
    console.log('该目录下项目已存在初始失败');
    return;
  }
  var dir = str ? str : path.join(templatePath, '/root');
  var data = getData();
  var self = this;
  ginit({
    dir: dir,
    data: data
  }, function (obj) {
    console.log('项目初始成功');
    obj && (isPc = obj.isPc);
    obj && (isSinglePage = obj.isSinglePage);
    if(isPc){
      ginit({
        dir: path.join(templatePath, '/pc'),
        data: data,
        dist: path.join(srcBase,'c')
      });
    }else{
      ginit({
        dir: path.join(templatePath, '/mobile'),
        data: data,
        dist: path.join(srcBase,'c')
      });
    }

    if(isSinglePage){
      ginit({
        dir: path.join(templatePath, '/routerInit'),
        data: data,
        dist: srcBase
      });
      ginit({
        dir: path.join(templatePath, '/router'),
        data: getData('index'),
        dist: path.join(srcBase,'r','index')
      });
    }else{
      self.p('index');
    }
    xtUtil.tnpmInstall()
  })
};


Tasks.p = function(name){
    if(!name){
      return console.log('请输入页面名称')
    }
    if(fs.existsSync(path.join(srcBase,'p',name))){
      return console.log('页面已存在创建失败')
    }
    var data = getData(name);
    data.pname = name;
    ginit({
      dir: path.join(templatePath, '/page'),
      data: data,
      dist: path.join(srcBase,'p',name)
   })
 };

//添加模块 
Tasks.c = function (name, routename) {
    if(!name){
      return console.log('请输入模块名称')
    }
    if(fs.existsSync(path.join(srcBase,'c',name))){
      return console.log('该模块已存在创建失败')
    }
  var data = getData(name);
  ginit({
      dir: path.join(templatePath, '/component'),
      data: data,
      dist: path.join(srcBase,'c',name)
  })

};

//添加数据
Tasks.data = function (name, type) {
  var objType = {
    'form': 'form',
    'f': 'form',
    'list': 'list',
    'l': 'list',
    'submit': 'submit',
    's': 'submit',
    'index': ''
  };
  type = objType[type] || objType['index'];
  var data = getData(name);
  var key = data.cameledName;
  var dist = path.join(srcBase, 'data/' + key + '.json');
  if (fs.existsSync(dist)) {
    console.log('文件已经存在创建失败' + dist);
    process.exit(1);
    return;
  }
  //data
  template({
    file: path.join(templatePath, 'data/' + (type || 'submit') + '.json'),
    dist: dist,
    data: data
  });
  injectData(data);
};


Tasks.start = function(){
  require('./lib/start').apply(null,arguments);
};

Tasks.build = function () {
  require('./lib/build').apply(null,arguments);
};



//获取数据
function getData(str) {
  var cameledName, classedName, scriptAppName, classname;
  scriptAppName = changeCameled(path.basename(cwdPath)) + 'App';
  cameledName = changeCameled(str);
  classedName = changeClassed(str);
  classname = classedName.toLowerCase();
  return util._extend(abc, {
    classname: classname, //全小写
    classedName: classedName, //大驼峰
    scriptAppName: scriptAppName, //项目app
    cameledName: cameledName,   //小驼峰
    router: str
  });

  function changeClassed(str) {
    if (!str) return str || '';
    var arr = str.split(/(_|-|\/|\\)/g);
    arr = arr.filter(function (url) {
      return !/(_|-|\/|\\)/g.test(url)
    });
    var newArr = [];
    arr.forEach(function (item) {
      if (item) {
        newArr.push(item.substr(0, 1).toUpperCase() + item.slice(1));
      }
    });
    return newArr.join('');
  }

  function changeCameled(str) {
    if (!str) return str || '';
    str = changeClassed(str);
    return str.substr(0, 1).toLowerCase() + str.slice(1);
  }
}

function injectCss(str, file) {
  var file = file || path.join(srcBase, '/main.less');
  if(fs.existsSync(file)) return;
  var content = fs.readFileSync(file, {encoding: 'utf8'});
  if (content.indexOf(str) === -1) {
    content = content + '\n' + str;
    console.log('file ' + file + ' inject success');
    fs.writeFile(file, content)
  }
}

function injectModule(file, str) {
  !fs.existsSync(file) && (file = path.join(srcBase, '/routers.js'));
  var content = fs.readFileSync(file, {encoding: 'utf8'});
  if (content.indexOf(str) === -1) {
    content = rewrite({
      needle: '/*angJSDeps*/',
      splicable: [str],
      haystack: content,
      spliceWithinLine: true
    });
    console.log('file ' + file + ' inject success');
    fs.writeFileSync(file, content)
  }
}

function injectRoute(data) {
  var file = path.join(srcBase, 'routers.jsx');
  if(!fs.existsSync(file)) return;
  var content = fs.readFileSync(file, {encoding: 'utf8'});
  content = rewrite({
    needle: '</Router',
    splicable: [
      "   <Router.Route name='" + data.router + "' handler={" + data.classedName + "}/>"
    ],
    haystack: content,
    spliceWithinLine: false
  });
  content = rewrite({
    needle: 'react-router',
    splicable: [
      "var " + data.classedName + " = require('./r/" + data.router + "/index');"
    ],
    haystack: content,
    spliceWithinLine: false
  });
  console.log('file ' + file + ' inject success');
  fs.writeFileSync(file, content)
}

//
function injectModal(file, splicable) {
  if (fs.existsSync(file)) {
    var content = fs.readFileSync(file, {encoding: 'utf8'});
    content = rewrite({
      needle: '/*modalinthetop*/',
      splicable: splicable,
      haystack: content,
      spliceWithinLine: false
    });
    console.log('file ' + file + ' inject success');
    fs.writeFileSync(file, content);
  }
}

function injectData(data) {
  var file = path.join(srcBase, 'c/util/apimap.js');
  if (fs.existsSync(file)) {
    var content = fs.readFileSync(file, {encoding: 'utf8'});
    var arr = [
      data.cameledName + ": {",
        "api: 'mtop.xxx',",
        "v: '1.0'",
      "},"
    ];
    if (isPc) {
      arr = [data.cameledName + ": ['xx','get'],"]
    }
    content = rewrite({
      needle: '/*invoke*/',
      splicable: arr,
      haystack: content,
      spliceWithinLine: false
    });
    console.log('file ' + file + ' inject success');
    fs.writeFileSync(file, content)
  }
}

