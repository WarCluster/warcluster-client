var BattleFieldView = require("./warcluster/views/battle-field");
var LandingView = require("./warcluster/views/landing");

module.exports = Backbone.Router.extend({
  routes: {
    "landing": "landing",
    "battle-field": "battleField"
  },
  initialize: function(options) {
    this.twitter = twitter;

    // Clear twitter credentials from global object
    twitter = null;
  },
  landing: function() {
    var landingView = new LandingView({twitter: this.twitter});
    $("body").html("").append(landingView.el)
    landingView.render();
  },
  battleField: function() {
    var battleField = new BattleFieldView({twitter: this.twitter});
    $("body").html("").append(battleField.el)
    battleField.render();
  }
});