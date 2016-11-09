## rx-toolkit 工具

####主要特点

*  webpack


### 安装

```
$ sudo npm install -g rx-toolkit

```

### 使用过程

`````
 mkdir my-new-project && cd $_
 rt init(初始化项目 )
 rt start（开启项目）
 rt build（打包）
 rt test （自行实现）
 rt publish （自行实现）
`````


### 命令使用
* rt start 开启项目
* rt build 打包项目
* rt init [url?] 项目初始化 后面参数实现自定义初始化
* rt data [name][type?] 创建本地mock数据type submit(s)list(l)data(d)
* rt p [name][type?] 创建页面
* rt c [name]  创建components



### 组件目录规范

```
  rx-xxx            // 组件目录名, 小写, 多字符用 – 分隔
     |------demo     // 用于存放demo的文件夹
     |      |-----demo-init.js   // 组件demo入口js文件
     |      |-----demo-init.less  //组件demo入口css文件
     |      |-----index.html   // 组件demo页面
     |------lib      // 用于存放组件的子模块
     |-----data      // 模拟数据文件
     |-----build    // 用于存放需要cdn发布的文件
     |-----test     // 单元测试放的目录
     |-----index.js   // 组件入口js文件
     |-----index.less // 组件入口css文件
     |-----index.xx // 组件入口模板文件
     |-----README.md    // 用于介绍组件文档
     |-----rt-config.js     //  配置文件
     |-----package.json     // 模块信息配置
```
 打包约定

````
['demo/*.js','demo/*.less','*.less,*.js']
````


## 项目目录规范

```
  m-xxx            // 目录名, 小写, 多字符用 – 分隔
     |-----data      // 模拟数据文件
     |-----build    // 用于存放需要cdn发布的文件
     |-----test     // 单元测试放的目录
     |-----src
     |      |---c    //项目通用组件
     |      |   |---util//项目js 共用文件夹
     |      |   |     |------index.js  //项目通用js模块
     |      |   |     |------apimap.js //项目url api 管理模块
     |      |   |---css//项目css 共用文件夹
     |      |   |     |------common.less  //项目通用less模块
     |      |   |     |------reset.less //页面重置less
     |      |   |---index// index 项目通用组件
     |      |   |     |------index.js  //
     |      |   |     |------index.jsx.html  //
     |      |   |     |------index.less  //
     |      |---p   //业务代码
     |      |   |---index//index 页面目录
     |      |   |     |------lib  //页面其他模块
     |      |   |     |------index.html //页面主页面html
     |      |   |     |------index.js //页面js入口
     |      |---images  //图片目录copy
     |      |---fonts  //font目录字体copy   
     |      |---static //static目录静态资源copy
     |-----README.md    // 用于介绍项目文档
     |-----rt-config.js     //  配置文件
   
```
默认打包约定

````
['src/p/*/index.js','src/images/**','src/fonts/**','src/static/**','src/minifys/**']
````


        

### bug反馈 zhoujianlin8@gmail.com

