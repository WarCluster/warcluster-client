var GameContext = require("../../data/GameContext");
var SpaceViewController = require("../../controllers/view/SpaceViewController");
var ResourcesLoader = require("../../loaders/resources/ResourcesLoader");

var PlanetsFactory = require("../../factories/planets/PlanetsFactory");
var MissionsFactory = require("../../factories/missions/MissionsFactory");
var CanvasTextFactory = require("../../factories/text/CanvasTextFactory");
var SunsFactory = require("../../factories/suns/SunsFactory");

var CommandsManager = require("../../managers/commands/CommandsManager");
var PlanetsManager = require("../../managers/planets/PlanetsManager");
var PlanetsTextureManager = require("../../managers/planets/PlanetsTextureManager");
var ShipsManager = require("../../managers/ships/ShipsManager");
var SunsManager = require("../../managers/suns/SunsManager");
var SunsTextureManager = require("../../managers/suns/SunsTextureManager");


var SpaceScene = require("../../scene/SpaceScene");

var KeyboardManager = require("../../managers/keyboard/KeyboardManager");

var MissionsMenu = require("../../controls/mission-menu");
var PlanetsSelection = require("../../controls/planets-selection");
var TwitterStream = require("../../controls/twitter-stream");
var Tutorial = require("../../controls/tutorial");
var LandingView = require("../landing");

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .toggle-landing-btn": "toggleLandingStatisticsView",
    "touchstart .toggle-landing-btn": "toggleLandingStatisticsView"
  },
  className: "game-container",
  initialize: function(options) {
    this.context = new GameContext();
    this.context.playerData = {
      twitter: options.twitter
    };
  },
  render: function() {
    this.$el.html(this.template());

    var self = this;

    this.context.$content = $(".content");
    this.context.currentTime = (new Date()).getTime();

    this.tutorialMenu = new Tutorial({context: this.context});
    $(".ui-container").append(this.tutorialMenu.render().el);

    this.context.missionsMenu = new MissionsMenu({context: this.context});

    this.context.planetsSelection = this.planetsSelection;
    $(".ui-container").append(this.context.missionsMenu.render().el);

    this.twitterStream = new TwitterStream();

    this.planetsSelection = new PlanetsSelection({context: this.context});
    this.planetsSelection.on("deselectPlanet", function(id) {
      var planet = self.context.objectsById[id];
      if (planet)
        planet.hideHoverSelection();

      self.spaceViewController.selection.deselectPlanetById(id);
    });

    this.planetsSelection.on("planetOver", function(id) {
      var planet = self.context.objectsById[id];
      if (planet)
        planet.showHoverSelection();
    });

    this.planetsSelection.on("planetOut", function(id) {
      var planet = self.context.objectsById[id];
      if (planet)
        planet.hideHoverSelection();
    });

    this.planetsSelection.on("scrollToPlanet", function(id) {
      var planet = self.context.objectsById[id];
      if (planet) {
        self.spaceViewController.scrollTo(planet.position.x, planet.position.y);
        self.spaceViewController.info.popover.remove();
      }
    });

    this.context.planetsSelection = this.planetsSelection;
    $(".ui-container").append(this.planetsSelection.render().el);

    this.context.resourcesLoader = new ResourcesLoader();

    this.context.planetsFactory = new PlanetsFactory(this.context);
    this.context.missionsFactory = new MissionsFactory(this.context);
    this.context.sunsFactory = new SunsFactory(this.context);

    this.context.canvasTextFactory = new CanvasTextFactory(true, this.context);

    this.context.planetsManager = new PlanetsManager(this.context);
    this.context.planetsManager.addEventListener("selectionDataUpdated", function(e) {
      self.planetsSelection.updatePopulations(e.updated);
    });

    this.context.planetsTextureManager = new PlanetsTextureManager(this.context);
    this.context.sunsTextureManager = new SunsTextureManager(this.context);

    this.context.spaceScene = new SpaceScene(this.context);
    this.context.spaceScene.addEventListener("complete", function() {
      console.log("--complete space scene--");
      self.connect();
    });


    this.spaceViewController = new SpaceViewController(this.context, {
      zoomer: {
        maxZoom: 145907,
        minZoom: 3000,
        zoomStep: 1200,
        zoom: 4000
      },
      scroller: {
        xMin: -5000000,
        xMax: 5000000,
        yMin: -4000000,
        yMax: 4000000
      }
    });

    this.spaceViewController.addEventListener("attackPlanet", function(e) {
      // console.log("-SEND ATTACK MISSION-");
      self.commandsManager.sendMission("Attack", e.attackSourcesIds, e.planetToAttackId, self.context.missionsMenu.getCurrentType());
    });

    this.spaceViewController.addEventListener("supplyPlanet", function(e) {
      // console.log("-SEND SUPPORT MISSION-");
      self.commandsManager.sendMission("Supply", e.supportSourcesIds, e.planetToSupportId, self.context.missionsMenu.getCurrentType());
    });
    this.spaceViewController.addEventListener("spyPlanet", function(e) {
      self.commandsManager.sendMission("Spy", e.spySourcesIds, e.planetToSpyId, self.context.missionsMenu.getCurrentType());
    });

    this.spaceViewController.addEventListener("selectPlanet", function(e) {
        self.planetsSelection.selectPlanet(e.planet.data);
        self.context.missionsMenu.showMenu();
    });

    this.spaceViewController.addEventListener("selectionChanged", function(e) {
      self.planetsSelection.selectionChanged(e);
      if (self.planetsSelection.hasPlanets())
        self.context.missionsMenu.showMenu();
      else
        self.context.missionsMenu.hideMenu();
    });

    this.spaceViewController.addEventListener("deselectAllPlanets", function(e) {
        self.planetsSelection.deselectAllPlanets();
        self.context.missionsMenu.hideMenu();
    });

    this.context.spaceViewController = this.spaceViewController;


    this.commandsManager = new CommandsManager(config.socketUrl, this.context);
    this.context.commandsManager = this.commandsManager;
    this.commandsManager.loginFn = function(data) {
      //we need this because of this - https://trello.com/c/l1gOcEJD/380-don-t-show-the-leaderboard-after-registration
      data.JustRegistered = self.context.playerData.JustRegistered;
      //because data doesn't have the correct value of JustRegistered(which is set in startGame method at landing view)
      _.extend(self.context.playerData, data);

      $(".ui-container").append(self.twitterStream.render(self.context.playerData.Race).el);
      console.log("-loginFn-", self.context.playerData);
      self.spaceViewController.activate(data.HomePlanet.Position.X, data.HomePlanet.Position.Y);
      // self.spaceViewController.scrollTo(data.HomePlanet.Position.X-50000, data.HomePlanet.Position.Y-50000);
      // self.spaceViewController.scrollTo(data.HomePlanet.Position.X, data.HomePlanet.Position.Y);

      if (!self.context.playerData.JustRegistered) {
        self.toggleLandingStatisticsView();
      }

      self.context.KeyboardManager = new KeyboardManager(self.context);

      self.shipsManager.prepare();
      self.sunsManager.prepare();
    }

    this.commandsManager.renderViewFn = function(data) {
      self.context.spaceScene.render(data);
    }

    this.commandsManager.requestSetupParameters = function() {
      self.toggleLandingRaceView();
    }
    this.commandsManager.toggleTutorial = function() {
      self.tutorialMenu.toggleTutorial();
    }

    this.shipsManager = new ShipsManager(this.context, 250000);
    this.context.shipsManager = this.shipsManager;

    this.sunsManager = new SunsManager(this.context, 1000);
    this.context.sunsManager = this.sunsManager;


    this.context.spaceScene.prepare();

    return this;
  },
  toggleLandingRaceView: function() {
    this.landingView = new LandingView(this.context);
    $(".ui-container").append(this.landingView.el);
    this.landingView.renderRacePick();
  },
  toggleLandingStatisticsView: function() {
    if ($(".landing-view").length === 0) {
      this.landingView = new LandingView(this.context);
      $(".ui-container").append(this.landingView.el);
      this.landingView.renderStatistics();
    }
  },
  connect: function() {
    this.commandsManager.prepare(
      this.context.playerData.twitter.screen_name,
      String(this.context.playerData.twitter.id)
    );
  }
})
