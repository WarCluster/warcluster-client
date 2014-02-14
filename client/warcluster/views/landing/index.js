var LeaderboardView = require("../leaderboard");
var statisticsRender = jadeCompile(require("./render/statistics.jade"));
var pickRaceRender = jadeCompile(require("./render/pick-race.jade"));


module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .start-game": "startGame",
    "click .race": "selectRace"
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
    $(".leaderboard-panel").html("").addClass("left-panel").append(this.leaderboard.render().el);

    return this;
  },
  renderRacePick: function() {
    this.$el.html(this.template({twitter: this.twitter}));
    this.$el.append(pickRaceRender());
    $(".pick-race-panel").addClass("left-panel");

    return this;
  },
  startGame: function() {
    $(".landing-view").remove();
    delete this.leaderboard;
    // router.navigate("battle-field", true)
  },
  selectRace: function(e) {
    // $(e.currentTarget).find(".race-color").css({"border-bottom": "5px outset #f26a21"});  }
  }
})
