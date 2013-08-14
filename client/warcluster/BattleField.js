var GameContext = require("./data/GameContext");
var SpaceViewController = require("./controllers/view/SpaceViewController");
var ResourcesLoader = require("./loaders/resources/ResourcesLoader");

var PlanetsFactory = require("./factories/planets/PlanetsFactory");
var MissionsFactory = require("./factories/missions/MissionsFactory");
var ShipsFactory = require("./factories/ships/ShipsFactory");
var CanvasTextFactory = require("./factories/text/CanvasTextFactory");
var SunsFactory = require("./factories/suns/SunsFactory");

var CommandsManager = require("./managers/commands/CommandsManager");
var SpaceScene = require("./scene/SpaceScene");
var MissionsMenu = require("./controls/mission-menu");

module.exports = function(){
	var self = this;

	this.context = new GameContext();
  this.context.$content = $(".content");
	this.context.activationTime = (new Date()).getTime();
	this.context.currentTime = this.context.activationTime;
	this.context.playerData = {
    twitter: twitter
  };

  // Clear twitter credentials from global object
  twitter = null;

  this.missionsMenu = new MissionsMenu();
  $(".ui-container").append(this.missionsMenu.render().el);
	
	this.context.resourcesLoader = new ResourcesLoader();

	this.context.planetsHitObjectsFactory = new PlanetsFactory(this.context);
	this.context.missionsFactory = new MissionsFactory(this.context);
	this.context.shipsFactory = new ShipsFactory(this.context);
	this.context.sunsFactory = new SunsFactory(this.context);

  this.context.canvasTextFactory = new CanvasTextFactory(true, this.context);

	this.context.spaceScene = new SpaceScene(this.context);
	this.context.spaceScene.addEventListener("complete", function() { 
		console.log("--complete space scene--");
		self.connect();
	});
  this.context.spaceScene.prepare();

	this.spaceViewController = new SpaceViewController(this.context, {
    zoomer: {
      zoom: 6000,
      maxZoom: 26000,
      minZoom: 6000,
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
    console.log("-SEND ATTACK MISSION-");
    for (var i = 0;i < e.attackSourcesIds.length;i ++)
      self.commandsManager.sendMission(e.attackSourcesIds[i], e.planetToAttackId);
  });

  this.spaceViewController.addEventListener("supportPlanet", function(e) {
    console.log("-SEND SUPPORT MISSION-");
    for (var i = 0;i < e.supportSourcesIds.length;i ++)
      self.commandsManager.sendMission(e.supportSourcesIds[i], e.planetToSupportId);
  });

	this.context.spaceViewController = this.spaceViewController;

  this.commandsManager = new CommandsManager(config.socketUrl, this.context);
  this.commandsManager.loginFn = function(data) {
    _.extend(self.context.playerData, data);

    console.log("-loginFn-", self.context.playerData);

    self.spaceViewController.activate();
    self.spaceViewController.setPosition(data.Position[0], data.Position[1]);

    this.scopeOfView(self.context.playerData.Position);
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