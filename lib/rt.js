/**
 * Created by zhou on 16/11/8.
 */
var fs = require('fs');
var path = require('path');
var config = {};
var util = require('util');
var ginit = require('ginit');
var cwd = process.cwd();
var configPath = path.join(cwd,'wrb-config.js');
if(fs.existsSync(configPath)){
    var wrbConfig = require(configPath);
    if(util.isFunction(wrbConfig)){
        config = wrbConfig(ginit) || {};
    }else{
        config = wrbConfig || {};
    }
}
var WRT = Object.assgin(require('ginit'),{
    config: config
});
module.exports = WRT;