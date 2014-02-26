var LeaderboardView = require("../leaderboard");
var statisticsRender = jadeCompile(require("./render/statistics.jade"));
var pickRaceRender = jadeCompile(require("./render/pick-race.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .start-game": "startGame",
    "click .race": "selectRace",
    "click .sun": "selectSun"
    // "click .toggle-leaderboard-btn": "showLeaderboard"
  },
  className: "landing-view container text-center",
  initialize: function(context) {
    this.context = context;
    this.twitter = context.playerData.twitter;

    this.selectedRace = -1;
    this.selectedSun = -1;
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
    if ($(".start-game").html() === "Start Game") {
      if ((this.selectedRace > -1 && this.selectedRace < 6) && (this.selectedSun > -1 && this.selectedSun < 2)) {
        this.context.commandsManager.setupParameters(this.selectedRace, this.selectedSun);
      } else {
        alert("You must pick both your race and your sun in order to continue");
        return;
      }
    }
    $(".landing-view").remove();
    delete this.leaderboard;
    // router.navigate("battle-field", true)
  },
  selectRace: function(e) {
    if ($(e.currentTarget).attr("data-id") > 3) return; //they're locked
    $(e.currentTarget).parent().find(".selected").removeClass("selected");
    $(e.currentTarget).find(".race-color").addClass("selected");
    this.selectedRace = parseInt($(e.currentTarget).attr("data-id"));
    // $(e.currentTarget).find(".race-color").css({"border-bottom": "5px outset #f26a21"});  }
  },
  selectSun: function(e) {
    if ($(e.currentTarget).attr("data-id") > 1) return; //they're locked
    $(e.currentTarget).parent().find(".selected").removeClass("selected");
    $(e.currentTarget).find("img").addClass("selected");
    this.selectedSun = parseInt($(e.currentTarget).attr("data-id"));   
  }
})
