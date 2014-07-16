var LeaderboardView = require("../leaderboard");
var statisticsRender = jadeCompile(require("./render/statistics.jade"));
var pickRaceRender = jadeCompile(require("./render/pick-race.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .start-game": "startGame",
    "click .race-choice": "selectRace",
    "click .sun-choice": "selectSun",
    "touchstart .race-choice": "selectRace",
    "touchstart .sun-choice": "selectSun",
    "touchstart .start-game": "startGame"
  },
  className: "landing-view container text-center",
  initialize: function(context) {
    this.context = context;
    this.twitter = context.playerData.twitter;

    this.selectedRace = 1;
    this.selectedSun = 1;
    this.selectedRaceName = Object.keys(this.context.serverParams.Races)[0];
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
      raceOne: Object.keys(this.context.serverParams.Races)[0],
      raceTwo: Object.keys(this.context.serverParams.Races)[1],
      raceThree: Object.keys(this.context.serverParams.Races)[2],
      raceFour: Object.keys(this.context.serverParams.Races)[3],
      raceFive: Object.keys(this.context.serverParams.Races)[4],
      raceSix: Object.keys(this.context.serverParams.Races)[5]
    }));
    $(".race-choice:nth-of-type(1) ").addClass("selected");
    $(".sun-choice:nth-of-type(1) ").addClass("selected");
    this._switchRace($(".btn-group-cl-effect a:first()"));

    return this;
  },
  startGame: function() {
    if ($(".start-game").html() === "Start Game") {
      if (confirm("Are you sure you want to start with " + this.selectedRaceName + "? You cannot change your race until the end of the round") === true) {
        this.context.commandsManager.setupParameters(this.selectedRace, this.selectedSun);
        this.context.commandsManager.toggleTutorial();
        this.context.playerData.JustRegistered = true;
      } else {
        return;
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
    this._switchRace($(e.currentTarget));
  },
  selectSun: function(e) {
    var sunPNGNumber = $(e.currentTarget).attr("data-id");
    $(e.currentTarget).parent().find(".selected").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    $(".sun-type").attr("src", "/images/suns/sun" + sunPNGNumber + ".png");
    this.selectedSun = parseInt($(e.currentTarget).attr("data-id"));   
  },
  _switchRace: function($selectedRace) {
    this.selectedRace = parseInt($($selectedRace).attr("data-id"));
    ////TODO: remove the trim() once you understand 
    //why when selecting "Hackafe" selectedRaceName = " Hackafe" (notice the whitespace infront)
    //https://trello.com/c/gQvImDwW/376-mysterious-whitespace-added-when-choosing-hackafe
    this.selectedRaceName = $.trim($selectedRace.text());
    var colors = {
      R: Math.floor(this.context.serverParams.Races[this.selectedRaceName].Color.R*255),
      G: Math.floor(this.context.serverParams.Races[this.selectedRaceName].Color.G*255),
      B: Math.floor(this.context.serverParams.Races[this.selectedRaceName].Color.B*255)
    }
    $(".race-hashtag-color").html("<a href='http://twitter.com/#WarCluster" + this.selectedRaceName + "' target='_blank'>#WarCluster" + this.selectedRaceName + "</a>");
    $(".race-hashtag-color a").css({"color":"rgba(" + colors.R + "," + colors.G + "," + colors.B +", 1) !important"});
    $(".overlay").css({"background-color":"rgba(" + colors.R + "," + colors.G + "," + colors.B + ", 0.6)"})
    $(".race-portrait img").attr('src', "/images/races/" + this.selectedRaceName + ".png");
  }
})
