require("../client/vendor/jquery");
require("../client/vendor/bootstrap.min");

require("../client/vendor/TweenLite.min");	
require("../client/vendor/plugins/jquery-mousewheel.min")($);
// require("../client/vendor/plugins/CSSPlugin.min");
// require("../client/vendor/easing/EasePack.min");

SockReconnect = require("../client/vendor/SockReconnect.min");

KeyboardJS = require("./vendor/keyboardjs.min");

_ = require("../client/vendor/underscore");
Backbone = require("../client/vendor/backbone");
humane = require("../client/vendor/humane.min");
humane.info = humane.spawn({ addnCls: 'humane-libnotify-info', timeout: 1000 });
humane.error = humane.spawn({ addnCls: 'humane-libnotify-error', timeout: 1000 });

require("../client/vendor/backbone/backbone_bind_to");

config = require("config");

window.jadeCompile = function(path){
  var compiled = jade.compile(path);
  return function(data) {
    data = data || {};
    data.t = $.t;
    return compiled(data);
  }
};