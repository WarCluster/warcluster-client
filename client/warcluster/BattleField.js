var GameContext = require("./data/GameContext");
var SpaceViewController = require("./controllers/view/SpaceViewController");
var ResourcesLoader = require("./loaders/resources/ResourcesLoader");

var PlanetsFactory = require("./factories/planets/PlanetsFactory");
var MissionsFactory = require("./factories/missions/MissionsFactory");
var ShipsFactory = require("./factories/ships/ShipsFactory");
var CanvasTextFactory = require("./factories/text/CanvasTextFactory");
var SunsFactory = require("./factories/suns/SunsFactory");

var CommandsManager = require("./managers/commands/CommandsManager");
var PlanetsManager = require("./managers/planets/PlanetsManager");

var SpaceScene = require("./scene/SpaceScene");
var MissionsMenu = require("./controls/mission-menu");
var PlanetsSelection = require("./controls/planets-selection");

module.exports = function(){
	var self = this;

	this.context = new GameContext();
  this.context.$content = $(".content");
	this.context.currentTime = (new Date()).getTime();
	this.context.playerData = {
    twitter: twitter
  };

  // Clear twitter credentials from global object
  twitter = null;

  this.missionsMenu = new MissionsMenu();
  $(".ui-container").append(this.missionsMenu.render().el);

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
    if (planet)
      self.spaceViewController.setPosition(planet.position.x, planet.position.y);
      self.spaceViewController.info.popover.remove();
  });

  this.context.planetsSelection = this.planetsSelection;
  $(".ui-container").append(this.planetsSelection.render().el);

  
  this.context.resourcesLoader = new ResourcesLoader();

  this.context.planetsHitObjectsFactory = new PlanetsFactory(this.context);
  this.context.missionsFactory = new MissionsFactory(this.context);
  this.context.shipsFactory = new ShipsFactory(this.context);
  this.context.sunsFactory = new SunsFactory(this.context);

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
      zoom: 8000,
      maxZoom: 60000000,
      minZoom: 8000,
      zoomStep: 2000
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
      self.commandsManager.sendMission("Attack" ,e.attackSourcesIds[i], e.planetToAttackId, self.missionsMenu.getCurrentType());
  });
  this.spaceViewController.addEventListener("scopeOfView", function(e) {
    var position = {
      x: Math.ceil(self.context.spaceViewController.scroller.scrollPosition.x),
      y: Math.ceil(self.context.spaceViewController.scroller.scrollPosition.y)
    };
    self.commandsManager.scopeOfView(position, self.context.spaceViewController.getResolution());
  });

  this.spaceViewController.addEventListener("supportPlanet", function(e) {
    // console.log("-SEND SUPPORT MISSION-");
    for (var i = 0;i < e.supportSourcesIds.length;i ++)
      self.commandsManager.sendMission("Supply", e.supportSourcesIds[i], e.planetToSupportId, self.missionsMenu.getCurrentType());
  });

  this.spaceViewController.addEventListener("selectPlanet", function(e) {
    self.planetsSelection.selectPlanet(e.planet.data);
  });

  this.spaceViewController.addEventListener("deselectPlanet", function(e) {
    self.planetsSelection.deselectPlanet(e.planet.data);
  });

  this.spaceViewController.addEventListener("deselectAllPlanets", function(e) {
    self.planetsSelection.deselectAllPlanets();
  });

  this.context.spaceViewController = this.spaceViewController;

  this.commandsManager = new CommandsManager(config.socketUrl, this.context);
  this.commandsManager.loginFn = function(data) {
    _.extend(self.context.playerData, data);

    // console.log("-loginFn-", self.context.playerData);

    self.spaceViewController.activate();
    self.spaceViewController.setPosition(data.Position.X, data.Position.Y);

    this.scopeOfView(self.context.playerData.Position, self.context.spaceViewController.getResolution());
    
    //humane.log("Welcome back General!", {image: "./images/adjutant.gif", timeout:8000, clickToClose: true});
  }

  this.commandsManager.renderViewFn = function(data) {
    self.context.spaceScene.render(data);
  }
}

module.exports.prototype.connect = function() {
  this.commandsManager.prepare(
    this.context.playerData.twitter.screen_name, 
    String(this.context.playerData.twitter.id)
  );
}