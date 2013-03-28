var boot = require("../../client/boot");

var BattleField = require("../../client/warcluster/BattleField");
var Commander = require("../../client/warcluster/commander/Commander");

var battleField;
var commander;

window.app = {};

$(document).ready(function() {
  /*var AppRouter = require("../client/AppRouter");
  app.router = new AppRouter();

  Backbone.history.start({trigger: true});*/

	battleField = new BattleField();
  commander = new Commander(battleField);

  $(".test2").click(function() {
    commander.test3();
  });

  $(".test1").click(function() {
    commander.test4();
  });
});

