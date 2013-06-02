var boot = require("../../client/boot");

var BattleField = require("../../client/warcluster/BattleField");
var Commander = require("../../client/warcluster/commander/Commander");

var battleField;
var commander;

window.app = {};
console.log("---------------------------------------")
$(document).ready(function() {
  /*var AppRouter = require("../client/AppRouter");
  app.router = new AppRouter();

  Backbone.history.start({trigger: true});*/
  console.log(this, this.twitter, arguments)
  

	battleField = new BattleField();
  commander = new Commander(battleField);

  $(".test2").click(function() {
    commander.test3();
  });

  $(".test1").click(function() {
    commander.test4();
  });
  var x = 0;
  var y = 0;
  $(".scroll-left").click(function() {
    x -= 200; 
    battleField.scroll(x, y);
  });

  $(".scroll-right").click(function() {
    x += 200; 
    battleField.scroll(x, y);
  });
});

