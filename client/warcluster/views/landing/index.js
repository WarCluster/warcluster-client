var LeaderboardView = require("../leaderboard");
var statisticsRender = jadeCompile(require("./render/statistics.jade"));
var pickRaceRender = jadeCompile(require("./render/pick-race.jade"));


module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .start-game": "startGame"
    // "click .toggle-leaderboard-btn": "showLeaderboard"
  },
  className: "landing-view container text-center",
  initialize: function(context) {
    this.twitter = context.twitter;
  },
  renderStatistics: function() {
    this.$el.html(this.template({twitter: this.twitter}));
    this.$el.append(statisticsRender());
    this.leaderboard = new LeaderboardView();
    $(".leaderboard-panel").html("").addClass("leaderboard-view-statistics").append(this.leaderboard.render().el);
    $(".landing-content").addClass("landing-content-statistics");
    return this;
  },
  renderRacePick: function() {
    this.$el.html(this.template({twitter: this.twitter}));
    this.$el.append(pickRaceRender());
    this.leaderboard = new LeaderboardView();
    $(".leaderboard-panel").html("").addClass("leaderboard-view-race").append(this.leaderboard.render().el);
    $(".landing-content").addClass("landing-content-race");
    return this;
  },
  startGame: function() {
    $(".landing-view").remove();
    delete this.leaderboard;
    // router.navigate("battle-field", true)
  }
})
