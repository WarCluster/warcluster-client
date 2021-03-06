// require("../client/vendor");
require("../client/vendor/jquery");
require("../client/vendor/bootstrap");
require("../client/vendor/TweenLite.min");
require("../client/vendor/plugins/jquery-mousewheel.min")($);
require("../client/vendor/plugins/CSSPlugin.min");
require("../client/vendor/easing/EasePack.min");
require("../client/vendor/itemslide.min");
Hammer = require("hammerjs");

ReconnectingWebSocket = require("../client/vendor/reconnecting-websocket.js");

KeyboardJS = require("./vendor/keyboardjs.min");

_ = require("../client/vendor/underscore");
Backbone = require("../client/vendor/backbone");

config = require("config");

//TODO: find a better notifications plugin........
$.noty.defaults = {
    layout: 'bottomLeft',
    theme: 'defaultTheme',
    type: '',
    text: '', // can be html or string
    dismissQueue: true, // If you want to use queue feature set this true
    template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
    animation: {
        open: {height: 'toggle'},
        close: {height: 'toggle'},
        easing: 'swing',
        speed: 500 // opening & closing animation speed
    },
    timeout: false, // delay for closing event. Set false for sticky notifications
    force: true, // adds notification to the beginning of queue when set to true
    modal: false,
    maxVisible: 15, // you can set max visible notification for dismissQueue true option,
    killer: false, // for close all notifications before show
    closeWith: ['click'], // ['click', 'button', 'hover']
    callback: {
        onShow: function() {},
        afterShow: function() {},
        onClose: function() {},
        afterClose: function() {}
    },
    buttons: false // an array of buttons
};


window.jadeCompile = function(path){
  var compiled = jade.compile(path);
  return function(data) {
    data = data || {};
    data.t = $.t;
    return compiled(data);
  }
};
