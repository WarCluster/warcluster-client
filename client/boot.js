require("../client/vendor/jquery");
require("../client/vendor/bootstrap.min");
require("../client/vendor/bootstrap-fileupload.min");

require("../client/vendor/TweenLite.min");
require("../client/vendor/plugins/CSSPlugin.min");
require("../client/vendor/easing/EasePack.min");

_ = require("../client/vendor/underscore");
Backbone = require("../client/vendor/backbone");
require("../client/vendor/backbone/backbone_bind_to");

window.jadeCompile = function(path){
  var compiled = jade.compile(path);
  return function(data) {
    data = data || {};
    data.t = $.t;
    return compiled(data);
  }
};