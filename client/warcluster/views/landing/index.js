var LeaderboardView = require("../leaderboard");
var statisticsRender = jadeCompile(require("./render/statistics.jade"));
var pickRaceRender = jadeCompile(require("./render/pick-race.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .start-game": "startGame",
    "click .start-game-btn": "startGame",
    "click .race-choice": "selectRace",
    "click .sun-choice": "selectSun",
    "click .next-step": "goToNextStep",
    "click .previous-step": "goToPreviousStep",
    "touchstart .race-choice": "selectRace",
    "touchstart .sun-choice": "selectSun",
    "touchstart .start-game": "startGame",
    "touchstart .start-game-btn": "startGame",
    "touchstart .next-step": "goToNextStep",
    "touchend .next-step": "goToNextStep",
    "touchstart .previous-step": "goToPreviousStep",
    "touchend .previous-step": "goToPreviousStep"
  },
  className: "landing-view container text-center",
  initialize: function(context) {
    this.context = context;
    this.twitter = context.playerData.twitter;

    this.selectedRace = 0;
    this.selectedSun = 0;
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
    $("ul").itemslide(
      {
        one_item: true,
        parent_width: true
      }
    );

    $(".race-choice:nth-of-type(1) ").addClass("active");
    $(".sun-choice:nth-of-type(1) ").addClass("active");
    this._switchRace($(".race-menu-container a:first()"));

    return this;
  },
  startGame: function(e) {
    if ($(".start-game-btn").html() === "Start Game") {
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
    $(e.currentTarget).parent().find(".active").css({"background-color": "rgb(33,33,33)"})
      .removeClass("active");
    $(e.currentTarget).addClass("active");
    this._switchRace($(e.currentTarget));
  },
  selectSun: function(e) {
    var sunPNGNumber = $(e.currentTarget).attr("data-id");
    $(e.currentTarget).parent().find(".active").removeClass("active");
    $(e.currentTarget).addClass("active");
    $(".sun-type").attr("src", "/images/suns/sun_texture" + sunPNGNumber + ".png");
    this.selectedSun = parseInt($(e.currentTarget).attr("data-id"));
  },
  goToNextStep: function(e) {
    $("ul").next(1);
    e.stopPropagation();
    e.preventDefault()
  },
  goToPreviousStep: function(e) {
    $("ul").previous();
    e.stopPropagation();
    e.preventDefault()
  },
  _switchRace: function($selectedRace) {
    this.selectedRace = this.context.serverParams.Races[$selectedRace.text()].ID;
    ////TODO: remove the trim() once you understand
    //why when selecting "Hackafe" selectedRaceName = " Hackafe" (notice the whitespace infront)
    //https://trello.com/c/gQvImDwW/376-mysterious-whitespace-added-when-choosing-hackafe
    this.selectedRaceName = $.trim($selectedRace.text());
    var hashtag = "#WarCluster";

    switch (this.selectedRaceName) {
      case "BurgasLab":
        hashtag += "Green";
        break;
      case "VarnaLab":
        hashtag += "Orange";
        break;
      case "Hackube":
        hashtag += "Blue";
      break;
      case "MegaDev":
        hashtag += "Pink";
      break;
      case "InitLab":
        hashtag += "Red";
      break;
      case "Hackafe":
        hashtag += "Yellow";
      break;
    }
    var colors = {
      R: Math.floor(this.context.serverParams.Races[this.selectedRaceName].Color.R*255),
      G: Math.floor(this.context.serverParams.Races[this.selectedRaceName].Color.G*255),
      B: Math.floor(this.context.serverParams.Races[this.selectedRaceName].Color.B*255)
    }
    $selectedRace.css({"background-color": "rgba(" + colors.R + "," + colors.G + "," + colors.B +", 0.5) !important"});
    $(".race-hashtag-color").html("<a href='http://twitter.com/" + hashtag + "' target='_blank'>" + hashtag + "</a>");
    $(".race-hashtag-color a").css({"color":"rgba(" + colors.R + "," + colors.G + "," + colors.B +", 1) !important"});
    $(".overlay").css({"background-color":"rgba(" + colors.R + "," + colors.G + "," + colors.B + ", 0.6)"})
    $(".race-portrait img").attr('src', "/images/races/" + this.selectedRaceName + ".png");
  }
})
