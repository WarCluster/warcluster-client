var SpaceViewController = require("./controllers/view/SpaceViewController");
var GameContext = require("./data/GameContext");
var ResourcesLoader = require("./loaders/resources/ResourcesLoader");

var PlanetsFactory = require("./factories/planets/PlanetsFactory");
var MissionsFactory = require("./factories/missions/MissionsFactory");
var ShipsFactory = require("./factories/ships/ShipsFactory");
var CanvasTextFactory = require("./factories/text/CanvasTextFactory");
var SunsFactory = require("./factories/suns/SunsFactory");

var CommandsManager = require("./commander/CommandsManager");

var SpaceScene = require("./scene/SpaceScene");

var UserPopover = require("./popovers/UserPopover");

module.exports = function(){
	var self = this;

	this.playerData = null;
	this.popover = new UserPopover();

	this.context = new GameContext();
  this.context.$content = $(".content");
	this.context.activationTime = (new Date()).getTime();
	this.context.currentTime = this.context.activationTime;
	this.context.cTemp = $("#cTemp");
	this.context.playerData = this.playerData;
	
	this.context.resourcesLoader = new ResourcesLoader();

	this.context.planetsFactory = new PlanetsFactory(this.context);
	this.context.missionsFactory = new MissionsFactory(this.context);
	this.context.shipsFactory = new ShipsFactory(this.context);
	this.context.canvasTextFactory = new CanvasTextFactory(this.context);
	this.context.sunsFactory = new SunsFactory(this.context);

	this.context.spaceScene = new SpaceScene(this.context);
	this.context.spaceScene.prepare();
	this.context.spaceScene.addEventListener("complete", function() { 
		console.log("--complete space scene--");
		self.connect();
	});

	this.attackMode = false;
	this.sourceTarget = null;
	this.enemyTarget = null;

	this.spaceViewController = new SpaceViewController(this.context);
	this.spaceViewController.zoom = 6000;
	this.spaceViewController.maxZoom = 60000000;
	this.spaceViewController.minZoom = 2000; //6000;
	this.spaceViewController.zoomStep = 2000;
	this.spaceViewController.addEventListener("selectPlanet", function(e) {
		self.popover.render();
    self.popover.move(e.position.x, e.position.y);

    if (self.attackMode) {
    	if (!self.sourceTarget) 
    		self.sourceTarget = e.target.planetData.id;
    	else {
    		self.attackMode = false;
    		self.commandsManager.attack(self.sourceTarget, e.target.planetData.id);

    		$(".attack-container").hide();
    	}
    }
	});

	this.spaceViewController.addEventListener("scrollProgress", function(e) {
		if (e.object)
			self.popover.move(e.position.x, e.position.y);
	}); 

	this.spaceViewController.addEventListener("zoomProgress", function(e) {
		if (e.object)
			self.popover.move(e.position.x, e.position.y);
	});

	this.context.spaceViewController = this.spaceViewController;
	this.spaceViewController.activate();

  this.commandsManager = new CommandsManager("http://127.0.0.1:7000/universe");
  this.commandsManager.loginFn = function(data) {
    console.log("-loginFn-", data);

    self.playerData = data;
    self.spaceViewController.setPosition(data.Position[0], data.Position[1]);

    this.scopeOfView(self.playerData.Position);
  }
  this.commandsManager.updateViewFn = function(data) {
    console.log("-updateViewFn-", data);
    self.context.spaceScene.update(data);
  }
}

module.exports.prototype.connect = function() {
  this.commandsManager.prepare("RobbFlynn" + Math.random(), "TwitterID" + Math.random());
}

module.exports.prototype.prepareAttack = function() {
	this.attackMode = true;
	$(".attack-container").show();
	
  console.log("-prepareAttack-");
}