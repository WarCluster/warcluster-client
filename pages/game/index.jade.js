var boot = require("../../client/boot");

var BattleField = require("../../client/warcluster/BattleField");
var Commander = require("../../client/warcluster/commander/Commander");

var battleField;
var commander;

window.app = {};

$(document).ready(function() {
  var x = 0;
  var y = 0;

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

  $(".scroll-left").click(function() {
    x -= 200; 
    battleField.scroll(x, y);
  });

  $(".scroll-right").click(function() {
    x += 200; 
    battleField.scroll(x, y);
  });

  $(".attack").click(function() {
    console.log(battleField.playerData)
    battleField.attack(battleField.playerData.HomePlanet.id, battleField.playerData.PlanetToAttack.id);
  });
  // USERVOICE widget
  (function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/ZD3yBKaqsWuw05GqkIQmyQ.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})()
  UserVoice = window.UserVoice || [];
  UserVoice.push(['showTab', 'classic_widget', {
    mode: 'full',
    primary_color: '#f69666',
    link_color: '#f1485e',
    default_mode: 'feedback',
    forum_id: 214551,
    tab_label: 'Feedback & Support',
    tab_color: '#a9466f',
    tab_position: 'middle-right',
    tab_inverted: false
  }]);
  // end of UserVoice widget
});

