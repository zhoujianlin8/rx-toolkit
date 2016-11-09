import Promise from 'Promise'; // mtop需要支持Promise 
import Mtop from '@ali/lib-mtop';
import Login from '@ali/lib-login';
var apiMap = require('./apimap') || {};
var curHost = window.location.hostname;

// var isOnline = document.location.href.indexOf('m.taobao.com') > -1;
 var arrLoacl = ['127.0.0.1', 'localhost', 'local.wapp.waptest.taobao.com', 'local.wapa.taobao.com', 'local.demo.taobao.net', 'local.m.taobao.com'];
 var isLocal = arrLoacl.indexOf(curHost) > -1;

/*//获取dip平台数据
 if (curHost === '127.0.0.1' || curHost === 'localhost' || curHost === '10.2.14.3') {
 Mtop.config.name = 'h5ApiUpdate.do'; // mtop的应用名称
 Mtop.config.mainDomain = 'taobao.net'; // mtop的主域
 Mtop.config.subDomain = 'demo'; // mtop的子域
 Mtop.config.prefix = 'api'; // mtop的前缀
 Mtop.config.protocol = 'http:'; // mtop的协议
 }*/
//默认设置监控 
/*window.__WPO && window.__WPO.setConfig({
    sample: 1
});*/

export default {
  getUrlParam: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = decodeURIComponent(window.location.search.substr(1)).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  },
   //获取页面相对位置 
  getRePageUrl: function (name) {
      if (isLocal) {
          return '../' + name + '/index.html'
      }
      return './' + name + '.html';
  },

  /**
   * 请求MTOP接口
   * 请统一调用该函数 方便维护
   */
  getMtopData: function (param, suc_cb, fail_cb) {
    if (curHost === 'localhost' || curHost === '127.0.0.1') return this._mockData(param, suc_cb, fail_cb);
    var param = param || {};
    var apiObj = apiMap[param.api];
    if (apiObj) {
      param.api = apiObj.api || param.api;
      param.v = param.v || apiObj.v || '1.0';
      apiObj.data && (param.data = $.extend(param.data || {},apiObj.data || {}));
    }
    if (!param.api) {
      console.log('请正确输入api地址');
      return;
    }
    var params = {
      api: param.api,
      v: param.v || '1.0',
      timeout: param.timeout || 3000,
      type: param.type || 'get',
      ecode: param.ecode === 1 ? 1 : 0,
      data: param.data || {}
    };

    //是否需要验证登陆
    if (!param.notCheckLoading && !Login.isLogin()) {
      //return Login.goLogin();
    }
    var oldtime = new Date().getTime();
    Mtop.request(params, function (result) {
      if (result.data && result.data.isSuccess === 'false') {
        var str = result.data.errorMsg || '后端出错';
        fail_cb && fail_cb(result, str);
        window.__WPO && window.__WPO.retCode(params.api, false, new Date().getTime()-oldtime, JSON.stringify(result.data));
        return //!param.noAlert && Modal.alert({title: str, modalButtonOk: '知道了'});
      }
      suc_cb && suc_cb(result);
    }, function (result) {
      //自动处理异常
      var str = result && result.ret && result.ret[0] ? result.ret[0].split("::")[1] : '后端服务异常';
      fail_cb && fail_cb(result, str);
      window.__WPO && window.__WPO.retCode(params.api, false, new Date().getTime()-oldtime, JSON.stringify(result));
      //登陆session 过期处理
      if (result && result.ret && (result.ret == 'FAIL_SYS_SESSION_EXPIRED' || (result.ret[0] && (result.ret[0] == 'ERR_SID_INVALID' || result.ret[0].split("::")[0] === 'FAIL_SYS_SESSION_EXPIRED')))) {
        /*Modal.confirm('session已过期，点击确定重新登录', function () {
          Login.goLogin()
        });*/
      } else {
        if(result && result.ret && result.ret[0] && result.ret[0] === 'TIMEOUT'){
          str = '请求服务超时';
        } 
        //!param.noAlert && Modal.alert({title: str, modalButtonOk: '知道了'});
      }
    });
  },
  //本地数据模拟
  _mockData: function (params, suc_cb, err_cb) {
    var url = '/data/' + params.api + '.json';
    $.ajax({
      data: params.data,
      url: url,
      success: function (res) {
        console.log('res', res);
        suc_cb && suc_cb(res)
      },
      error: function (res) {
        err_cb && err_cb(res);
      }
    })
  },
  //隐藏键盘
  hideKeyboard: function () {
    var $a = $('<a style="width: 0;height: 0;font-size: 0;display: block"></a>');
    $('body').append($a);
    $a.focus();
    setTimeout(function () {
      $a.remove();
    }, 0)
  },

  //处理穿透
  stopEventTap: function () {
    var $el = $('<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 99999; "></div>');
    $('body').append($el);
    setTimeout(function () {
      $el.remove();
    }, 350);
  }
};
