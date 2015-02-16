var BattleFieldView = require("./warcluster/views/battle-field");
var LandingView = require("./warcluster/views/landing");
var LeaderboardView = require("./warcluster/views/leaderboard")

module.exports = Backbone.Router.extend({
  routes: {
    // "landing": "landing",
    "battle-field": "battleField",
    "leaderboard": "leaderboard"
  },
  initialize: function(options) {
    this.twitter = twitter;

    // Clear twitter credentials from global object
    twitter = null;
  },
  battleField: function() {
    var battleField = new BattleFieldView({twitter: this.twitter});
    $("body").html("").append(battleField.el);
    $("body").css({"overflow": "hidden"});
    battleField.render();
  },
  leaderboard: function() {
    var leaderboard = new LeaderboardView();
    $("body").html("").append(leaderboard.el);
    $("body").css({"overflow": "hidden"});
    leaderboard.render();
  }
});