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

	this.sockjs = null;
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
	this.context.spaceScene.addEventListener("complete", function() { 
		console.log("--complete space scene--");
		_self.connect();
	});

	this.spaceViewController = new SpaceViewController(this.context);
	this.spaceViewController.zoom = 6000;
	this.spaceViewController.maxZoom = 60000000;
	this.spaceViewController.minZoom = 2000; //6000;
	this.spaceViewController.zoomStep = 2000;

	this.context.spaceViewController = this.spaceViewController;
	this.spaceViewController.activate();
}

module.exports.prototype.scroll = function(x, y) {
	console.log("scroll:", x, y)
	this.sockjs.send(JSON.stringify({"Command": "scope_of_view", "Position": [x, y], "Resolution": [1920, 1080]}));
}

module.exports.prototype.connect = function() {
	var self = this;
	
	var parseCommand = function(data) {
		if (data.Username) {
			console.log("1.parseCommand:", data);
			self.sockjs.send(JSON.stringify({"Command": "scope_of_view", "Position": [0, 0], "Resolution": [1920, 1080]}));
		} else switch (data.Command) {
			case "scope_of_view_result":
				var renderData = {
					objects: [],
					missions: []
				}
				console.log("2.parseCommand:", data);
				var pos, item;
				var sc = 2;
				for (var s in data.Planets) {
					item = data.Planets[s];

					if (s.indexOf("planet") != -1) {
						pos = s.split("planet.").join("").split("_");
						renderData.objects.push({
							xtype: "PLANET",
							data: item,
							position: {
								x: pos[0] * sc,
								y: pos[1] * sc
							}
						});
					} else if (s.indexOf("sun") != -1) {
						pos = s.split("sun.").join("").split("_");
						renderData.objects.push({
							xtype: "SUN",
							data: item,
							position: {
								x: pos[0] * sc,
								y: pos[1] * sc
							}
						});
					}
				}

				self.context.spaceScene.update(renderData);
			break;
		}
	}

	this.sockjs = new SockJS('http://127.0.0.1:7000/universe');
	this.sockjs.onopen = function() {
		console.log('open');
	};
	console.log(this.sockjs)
	this.sockjs.onmessage = function(e) {
      //console.log(e.data);
      switch (e.data) {
      	case "Username: ":
      	self.sockjs.send("RobbFlynn");
      	break;
      	case "TwitterID: ":
      	self.sockjs.send("asdasdasd");
      	break;
      	default: 
      	try {
      		var data = JSON.parse(e.data);
      		parseCommand(data);
      	} catch(err) {
      		console.log("------- Error -------:", e.data)
      	}
      	break;
      }
    };
    this.sockjs.onclose = function() {
    	console.log('close');
    };
  }

  module.exports.prototype.renderData = function(data) {
  	this.context.spaceScene.update(data);
  }