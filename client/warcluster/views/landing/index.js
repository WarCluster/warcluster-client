var LeaderboardView = require("../leaderboard");
var statisticsRender = jadeCompile(require("./render/statistics.jade"));
var pickTeamRender = jadeCompile(require("./render/pick-team.jade"));


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
    this.$el.append(pickTeamRender());
    this.leaderboard = new LeaderboardView();
    $(".leaderboard-panel").html("").addClass("leaderboard-view").append(this.leaderboard.render().el);
    return this;
  },
  startGame: function() {
     $(".ui-container").css({"overflow": "hidden"});
    $(".landing-view").remove();
    // router.navigate("battle-field", true)
  },
  showLeaderboard: function() {
    if ($(".leaderboard-content").length === 0) {
    } else {
      $(".leaderboard-content").remove();
      $(".leaderboard-panel").removeClass("leaderboard-view");
    }
  }
})
