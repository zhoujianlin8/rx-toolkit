/**
 * Created by jianlin.zjl on 15-9-21.
 */
var fs = require('fs');
var cwdPath = process.cwd();
var glob = require('ginit').globby;
var path = require('path');
var webpack = require('webpack');
var util = require('util');
var NpmImportPlugin = require("less-plugin-npm-import");
var os = require('os');
var importPlugin = new NpmImportPlugin({prefix: '~'}); //
module.exports = {
  getLessConfig: function(options){
    var absSrc = path.join(cwdPath,options.srcBase);
    return {
      paths : [absSrc,path.join(cwdPath,'node_modules')],
      plugins: [importPlugin]
    }
  },
  getPlugins: function (defaultWebpackOption,options) {
    var plugins = defaultWebpackOption.plugins || [];
    options.isHot && plugins.push(new webpack.HotModuleReplacementPlugin());
    // defaultWebpackOption.ignoreModule && (plugins.push(new webpack.IgnorePlugin(new RegExp(defaultWebpackOption.ignoreModule))));
    if(options.isCssRequire !== false && options.isExtractCSS !== false){
      var ExtractTextPlugin = require('extract-text-webpack-plugin');
      plugins.push(
        new ExtractTextPlugin('[name].bundle.css', {
          allChunks: true
        })
      );
    }
    var arrCommonsChunk = options.arrCommonsChunk || [];
    arrCommonsChunk && !util.isArray(arrCommonsChunk) && (arrCommonsChunk = [arrCommonsChunk]);
    if(options.isExtractReact === true){
      arrCommonsChunk.push({
        filename: options.isBuild ? null :options.srcBase+'/react.js',
        name: "react"
      })
    }
    if(options.isExtractCommon === true){
      arrCommonsChunk.push({
        filename: options.isBuild ? null :options.srcBase+'/common.js',
        name: 'common'
      })
    }

    arrCommonsChunk.forEach(function(item){
      item  && plugins.push(new webpack.optimize.CommonsChunkPlugin(item));
    });

    return plugins;
  },
  getVersion: function (v) {
    if (!v || v === '@branch@') {
      var headerFile = path.join(cwdPath,'.git/HEAD');
      var gitVersion = fs.existsSync(headerFile) && fs.readFileSync(headerFile, {encoding: 'utf8'}) || '';
      var arr = gitVersion.match(/(\d+\.\d+\.\d+)/g);
      v = arr && arr[0] || '0.0.1';
    }
    return v;
  },
  hotFile: function(options,file){
    if(options.isHot){
      var clientPath = path.join(__dirname,'../node_modules/koa-webpack-hot-middleware/node_modules/webpack-hot-middleware/client.js');
      if(!fs.existsSync(clientPath)){
        clientPath = path.join(__dirname,'../node_modules/webpack-hot-middleware/client');
      }
      var hotMiddlewareScript = clientPath+'?path=/__webpack_hmr&timeout=20000'+ (options.isReload!== false ? '&reload=true': '');
      return [file,hotMiddlewareScript]
    }
    return file;
  },
  getWebpackConfig: function(options,abc){
    var baseSrc = path.join(cwdPath,options.srcBase);
    var outputPath  = '';
    var args = options.args ? options.args.split(','):[];
    var self = this;
    if(options.isBuild && options.buildTo){
      outputPath = path.join(cwdPath,options.buildTo);
    }else if(options.isCom){
      outputPath = cwdPath;
    }else{
      outputPath = baseSrc;
    }
    var output = {
      path: outputPath,
      publicPath: '/',
      filename: '[name].js',
      chunkFilename: '[id].chunk.js'
    };
    options.isServer && (output.publicPath = '//'+self.getIPAddress()+':'+options.port+'/');
    if(options.isBuild){
      var assets = args[0] === 'p' || args[0] === 'publish' ? '//g.alicdn.com': '//g.assets.daily.taobao.net';
      output.publicPath = options.buildPublishPath || assets+'/'+abc.group+'/'+abc.name+'/'+this.getVersion(abc.version)+'/'
    }
    options.isOutputUmd && (output.libraryTarget = 'umd');
    var jsExclude = /node_modules[\\\/](?!clustars-com)/;
    if(options.jsExclude){
      jsExclude = new RegExp(options.jsExclude)
    }

    var loaders = [{
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
    
      exclude: jsExclude, //node_module下文件除了xx js全部忽略babel
      query: {
        cacheDirectory: false, // 缓存有bug
        //babelrc: false, //babel6 支持
        breakConfig: true, //babel5 支持不读配置文件
        //presets: ['react', 'es2015', 'stage-0'], //速度太慢
      }
    }];
    if(options.isCssRequire !== false){
      var ExtractTextPlugin = require('extract-text-webpack-plugin');
      var localIdentName = options.localIdentName || '[local]___[hash:base64:5]';
      var urlDisables = options.urlDisables !== false; //url 不进行校验
      var cssLoader = options.isCssModule === true ? 'css-loader?'+(urlDisables ? '-url&': '')+'modules&importLoaders=1&localIdentName='+localIdentName : 'css-loader'+(urlDisables ? '?-url': '');
      var lessLoader = '!less-loader';//+self.getLessQuery(options);
      loaders.push({
        test: /\.css$/,
        // exclude: /node_modules/,
        loader: options.isExtractCSS !== false ? ExtractTextPlugin.extract('style-loader', cssLoader) : 'style-loader!'+cssLoader
      });
      loaders.push({
        test: /\.less/,
        // exclude: /node_modules/,
        //query: self.getLessConfig(options),
        loader: options.isExtractCSS !== false ? ExtractTextPlugin.extract('style-loader', cssLoader+lessLoader) : 'style-loader!'+cssLoader+lessLoader
      });
    }
    var moduleObj = {
      loaders: loaders
    };
    var entryObj = {};
    //
    if(options.isBuild){
      options.srcBase = '';
    }
    if(options.isCom){
      if(options.isCDN === true){
        glob.sync(['*.js','*.jsx'],{cwd: cwdPath}).forEach(function(item,b){
          var key = path.join(cwdPath,item.replace(/\.(jsx|js)$/g,''));
          if(options.buildTo){
            key = key.replace(cwdPath,path.join(cwdPath,options.buildTo))
          }
          entryObj[key] = self.hotFile(options,path.join(cwdPath,item));
        });
      }else{
        glob.sync(['demo/*.js','demo/*.jsx'],{cwd: cwdPath}).forEach(function(item,b){
          var key = path.join(cwdPath,item.replace(/\.(jsx|js)$/g,''));
          if(options.isBuild && options.buildTo){
            key = key.replace(path.join(cwdPath,'demo'),path.join(cwdPath,options.buildTo))
          }
          entryObj[key] = self.hotFile(options,path.join(cwdPath,item));
        });
      }

    }else if(options.isSinglePage){
      var key = path.join(options.srcBase,'app');
      entryObj[key] = self.hotFile(options,path.join(baseSrc,'app'));
    }else{
      var arrsync = ['p/*/*.js','p/*/*.jsx','app.js','app.jsx'];
      //fie start p/index
      if(/^p[\\\/]/g.test(args[0]+'') && fs.existsSync(path.join(baseSrc,args[0]))){
        arrsync = [args[0]+'/*.js',args[0]+'/*.jsx']
      };
      glob.sync(arrsync,{cwd: baseSrc}).forEach(function(item,b){
        var key = path.join(options.srcBase,item.replace(/\.(jsx|js)$/g,''));
        entryObj[key] = self.hotFile(options,path.join(baseSrc,item));
      });
    }
    if(util.isArray(options.extractReactModules)){
      options.isExtractReact =true;
    }
    if(util.isArray(options.extractCommonModules)){
      options.isExtractCommon = true
    }
    var alias = options.alias || {};
    for (var key in alias){
      alias[key] = path.join(cwdPath,alias[key])
    };
    options.isExtractReact === true && (entryObj['react'] = options.extractReactModules || ['react']);
    options.isExtractCommon === true &&  (entryObj['common'] = options.extractCommonModules || []);
    var webpackConfig =  {
      output: output,
      resolve: {
        root: path.join(__dirname, '../node_modules'),
        extensions: ['', '.js', '.jsx'],
        alias: alias
      },
      resolveLoader: { root: path.join(__dirname, "../node_modules")},
      entry: entryObj,
      module : moduleObj,
    };
    var serverDefaultConfig = {
      plugins: [
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
      ],
      cache: true,
      debug: true,
      devtool: 'source-map'
    };

    var buildDefaultConfig = {
      plugins: [new webpack.DefinePlugin({ "process.env": { NODE_ENV: JSON.stringify("production") }})],
      cache: true,
      debug: false,
      devtool: false
    };
    var uglifyConfig  = options.uglifyConfig || {
        compress: {
          unused: true,
          dead_code: true,
          warnings: false
        },
        //不进行混淆
        mangle: {
          except: ['$', 'exports', 'require']
        }
      };
    options.isBuild && options.isMinify && buildDefaultConfig.plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyConfig));
    webpackConfig = options.isBuild ? util._extend(webpackConfig,buildDefaultConfig) : util._extend(webpackConfig,serverDefaultConfig);
    webpackConfig = util._extend(webpackConfig,options.webpack || {}); //abc.json中
    webpackConfig.plugins = this.getPlugins(webpackConfig,options);
    var configPath = path.join(cwdPath,'fie-webpack-config.js');
    if(fs.existsSync(configPath)){
      var fn = require(configPath);
      if(typeof fn === 'function'){
        var fie = util._extend({},ginit);
        fie.abc = abc;
        fie.webpackConfig = webpackConfig;
        fie.options = options;
        fie.webpack = webpack;
        fie.getRequire = function(name){
          return require(name);
        };
        webpackConfig = fn(fie,webpackConfig) || webpackConfig;
      }
    }
    return webpackConfig;
  },
  getIPAddress: function(){
    var ifaces = os.networkInterfaces();
    var ip = '';
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (ip === '' && details.family === 'IPv4' && !details.internal) {
          ip = details.address;
          return;
        }
      });
    }
    return ip || "127.0.0.1";
  }
};