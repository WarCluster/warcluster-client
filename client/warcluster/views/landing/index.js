var LeaderboardView = require("../leaderboard");
var statisticsRender = jadeCompile(require("./render/statistics.jade"));
var pickRaceRender = jadeCompile(require("./render/pick-race.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .start-game": "startGame",
    "click .race-choice": "selectRace",
    "click .sun-choice": "selectSun"
  },
  className: "landing-view container text-center",
  initialize: function(context) {
    this.context = context;
    this.twitter = context.playerData.twitter;

    this.selectedRace = 1;
    this.selectedSun = 1;
  },
  renderStatistics: function() {
    this.$el.html(this.template({twitter: this.twitter}));
    this.$el.append(statisticsRender());
    this.leaderboard = new LeaderboardView();
    $(".leaderboard-panel").html("").addClass("left-panel").append(this.leaderboard.render(this.context.playerData.Username).el);

    return this;
  },
  renderRacePick: function() {
    this.$el.html(this.template({twitter: this.twitter}));
    this.$el.append(pickRaceRender());
    $(".race-choice:nth-of-type(1) ").addClass("selected");
    $(".sun-choice:nth-of-type(1) ").addClass("selected");

    return this;
  },
  startGame: function() {
    if ($(".start-game").html() === "Start Game") {
      if (confirm("Are you sure you want to start this way?") === true) {
        this.context.commandsManager.setupParameters(this.selectedRace, this.selectedSun);
        this.context.commandsManager.toggleTutorial();
      } 
    }
    if(this.leaderboard) {
      clearTimeout(this.leaderboard.leaderboardAjaxTimeout);
      delete this.leaderboard.leaderboardAjaxTimeout;
    }
    TweenLite.to($(".landing-view"), 0.2, {
      css: {
        height: "120px",
        width: "100px",
        right: "0px",
        top: "95%"
      },
      ease: Cubic.easeOut,
      onComplete: function() {
        $(".landing-view").remove();
        delete this.leaderboard;    
      }
    });
    // router.navigate("battle-field", true)
  },
  selectRace: function(e) {
    $(e.currentTarget).parent().find(".selected").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    this.selectedRace = parseInt($(e.currentTarget).attr("data-id"));
  },
  selectSun: function(e) {
    var sunPNGNumber = $(e.currentTarget).attr("data-id");
    $(e.currentTarget).parent().find(".selected").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    $(".sun-type").css({"background-image": "url('/images/suns/sun" + sunPNGNumber +".png')"})
    this.selectedSun = parseInt($(e.currentTarget).attr("data-id"));   
  }
})
