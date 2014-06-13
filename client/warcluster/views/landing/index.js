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

    this.teams = this.context.Teams;
    for(name in this.teams) {
      this.teams[name].R = this.teams[name].R * 255;
      this.teams[name].G = this.teams[name].G * 255;
      this.teams[name].B = this.teams[name].B * 255;
    }
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
    this.$el.append(pickRaceRender({
      raceOne: Object.keys(this.teams)[0],
      raceTwo: Object.keys(this.teams)[1],
      raceThree: Object.keys(this.teams)[2],
      raceFour: Object.keys(this.teams)[3],
      raceFive: Object.keys(this.teams)[4],
      raceSix: Object.keys(this.teams)[5]
    }));
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
    var selectedRaceName = $(e.currentTarget).text();

    //TODO: remove the try-catch once you understand 
    //why when selecting "Hackafe", selectedRaceName = " Hackafe" (notice the whitespace infront)
    try {
      $(".overlay").css({"background-color":"rgba(" + Math.ceil(this.teams[selectedRaceName].R) + "," + Math.ceil(this.teams[selectedRaceName].G) + "," + Math.ceil(this.teams[selectedRaceName].B) + "," + "0.6)"})
    } catch(e) {
      console.log(e);
      selectedRaceName = "Hackafe";
      $(".overlay").css({"background-color":"rgba(" + Math.ceil(this.teams[selectedRaceName].R) + "," + Math.ceil(this.teams[selectedRaceName].G) + "," + Math.ceil(this.teams[selectedRaceName].B) + "," + "0.6)"})
    }
  },
  selectSun: function(e) {
    var sunPNGNumber = $(e.currentTarget).attr("data-id");
    $(e.currentTarget).parent().find(".selected").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    $(".sun-type").css({"background-image": "url('/images/suns/sun" + sunPNGNumber +".png')"})
    this.selectedSun = parseInt($(e.currentTarget).attr("data-id"));   
  }
})
