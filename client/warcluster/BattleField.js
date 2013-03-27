//var Selection = require("./selection/Selection");
var SpaceViewController = require("./controllers/view/SpaceViewController");
var GameContext = require("./data/GameContext");
var ResourcesLoader = require("./loaders/resources/ResourcesLoader");

var Planet = require("./planets/Planet");

var PlanetsFactory = require("./factories/planets/PlanetsFactory");
var MissionsFactory = require("./factories/missions/MissionsFactory");
var ShipsFactory = require("./factories/ships/ShipsFactory");
var CanvasTextFactory = require("./factories/text/CanvasTextFactory");
var SunsFactory = require("./factories/suns/SunsFactory");

var SpaceScene = require("./scene/SpaceScene");

module.exports = function(){
	var _self = this;

	this.playerData = {
		id: "-PLAYER1-"
	};

	var ww = window.innerWidth;
  var hh = window.innerHeight;

	this.context = new GameContext();
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

	this.spaceViewController = new SpaceViewController(this.context);
	this.spaceViewController.zoom = 6000;
	this.spaceViewController.maxZoom = 60000000;
	this.spaceViewController.minZoom = 2000; //6000;
	this.spaceViewController.zoomStep = 2000;

	this.context.spaceViewController = this.spaceViewController;
	this.spaceViewController.activate();
}

module.exports.prototype.renderData = function(data) {
	this.context.spaceScene.update(data);
}