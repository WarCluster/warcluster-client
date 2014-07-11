var GameContext = require("../../data/GameContext");
var SpaceViewController = require("../../controllers/view/SpaceViewController");
var ResourcesLoader = require("../../loaders/resources/ResourcesLoader");

var PlanetsFactory = require("../../factories/planets");
var MissionsFactory = require("../../factories/missions");
var ShipsFactory = require("../../factories/ships");
var CanvasTextFactory = require("../../factories/text");
var SunsFactory = require("../../factories/suns");
var WaypointsFactory = require("../../factories/waypoints");

var CommandsManager = require("../../managers/commands/CommandsManager");
var PlanetsManager = require("../../managers/planets/PlanetsManager");
var KeyboardManager = require("../../managers/keyboard/KeyboardManager");

var SpaceScene = require("../../scene/SpaceScene");

var MissionsMenu = require("../../controls/mission-menu");
var PlanetsSelection = require("../../controls/planets-selection");
var TwitterStream = require("../../controls/twitter-stream");
var Tutorial = require("../../controls/tutorial");
var LandingView = require("../landing");

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: { 
    "click .toggle-landing-btn": "toggleLandingStatisticsView"
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
    this.context.shipsFactory = new ShipsFactory(this.context);
    this.context.sunsFactory = new SunsFactory(this.context);
    this.context.waypointsFactory = new WaypointsFactory(this.context);

    this.context.canvasTextFactory = new CanvasTextFactory(true, this.context);

    this.context.planetsManager = new PlanetsManager(this.context);
    this.context.planetsManager.addEventListener("selectionDataUpdated", function(e) { 
      self.planetsSelection.updatePopulations(e.updated);
    });

    this.context.spaceScene = new SpaceScene(this.context);
    this.context.spaceScene.addEventListener("complete", function() { 
      console.log("--complete space scene--");
      self.connect();
    });
    this.context.spaceScene.prepare();

    this.spaceViewController = new SpaceViewController(this.context, {
      zoomer: {
        maxZoom: 60000000,
        minZoom: 4000,
        zoomStep: 1500,
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
      for (var i = 0;i < e.attackSourcesIds.length;i ++)
        self.commandsManager.sendMission("Attack" ,e.attackSourcesIds[i], e.planetToAttackId, self.context.missionsMenu.getCurrentType(), e.waypoints);
    });

    this.spaceViewController.addEventListener("supplyPlanet", function(e) {
      // console.log("-SEND SUPPORT MISSION-");
      for (var i = 0;i < e.supportSourcesIds.length;i ++)
        self.commandsManager.sendMission("Supply", e.supportSourcesIds[i], e.planetToSupportId, self.context.missionsMenu.getCurrentType(), e.waypoints);
    });
    this.spaceViewController.addEventListener("spyPlanet", function(e) {
      for (var i = 0; i < e.spySourcesIds.length; i++) {
        self.commandsManager.sendMission("Spy", e.spySourcesIds[i], e.planetToSpyId, self.context.missionsMenu.getCurrentType(), e.waypoints)
      };
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

    /*this.spaceViewController.addEventListener("scopeOfView", function(e) {
      //TODO: https://trello.com/c/slSUdtQd/214-fine-tune-scope-of-view-to-not-spam
      var position = {
        x: Math.ceil(self.context.spaceViewController.scrollPosition.x),
        y: Math.ceil(self.context.spaceViewController.scrollPosition.y)
      };
      self.commandsManager.scopeOfView(position, self.context.spaceViewController.getResolution());
    });*/
    
    this.context.spaceViewController = this.spaceViewController;


    this.commandsManager = new CommandsManager(config.socketUrl, this.context);
    this.context.commandsManager = this.commandsManager;
    this.commandsManager.loginFn = function(data) {
      _.extend(self.context.playerData, data);
      
      $(".ui-container").append(self.twitterStream.render(self.context.playerData.Race).el);
      console.log("-loginFn-", self.context.playerData);
      self.spaceViewController.activate();
      self.spaceViewController.scrollTo(data.HomePlanet.Position.X-50000, data.HomePlanet.Position.Y-50000);
      self.spaceViewController.scrollTo(data.HomePlanet.Position.X, data.HomePlanet.Position.Y);
      
      self.toggleLandingStatisticsView();

      this.context.KeyboardManager = new KeyboardManager(self.context);
      //humane.log("Welcome back General!", {image: "./images/adjutant.gif", timeout:8000, clickToClose: true});
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
