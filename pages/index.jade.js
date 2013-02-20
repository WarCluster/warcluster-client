var BattleField = require("../client/warcluster/BattleField");
var Commander = require("../client/warcluster/commander/Commander");

require("../client/vendor/TweenLite.min");
require("../client/vendor/plugins/CSSPlugin.min");
require("../client/vendor/easing/EasePack.min");

var battleField;
var commander;

$(document).ready(function() {
	battleField = new BattleField();
  commander = new Commander(battleField);

  $(".test1").click(function() {
    commander.test1();
  });

  $(".test2").click(function() {
    commander.test2();
  });

  $(".test3").click(function() {
    commander.test3();
  });

  $(".test4").click(function() {
    commander.test4();
  });
});

