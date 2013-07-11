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
		Username: "",
		Position: null,
		HomePlanet: null
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
  var command = JSON.stringify({
    "Command": "scope_of_view", 
    "Position": [x, y], 
    "Resolution": [1920, 1080]
  });

  console.log("scroll:", x, y, command)

	this.sockjs.send(command);
}

module.exports.prototype.attack = function(source, target) {
	console.log("attack:", source, target)
	this.sockjs.send(JSON.stringify({
    "Command": "start_mission",
    "StartPlanet": source,
    "EndPlanet": target,
    "Fleet": 40
}));
}

module.exports.prototype.parseCommand = function(command) {
	//console.log("###.parseCommand:", command);

	switch (command) {
  	case "Username: ":
    	this.sockjs.send("Robb Flynn" + Math.random());
  	break;
  	case "TwitterID: ":
    	this.sockjs.send("TwitterID" + Math.random());
  	break;
  	default: 
  	try {
  		var data = JSON.parse(command);
  		console.log(data);
  		switch (data.Command) {
				case "login_success":
					this.playerData.Username = data.Username;
					this.playerData.Position = data.Position;

					this.sockjs.send(JSON.stringify({"Command": "scope_of_view", "Position": [0, 0], "Resolution": [1920, 1080]}));
				break;
				case "scope_of_view_result":
					var renderData = {
						objects: [],
						missions: []
					}
					
					var pos, item;
					var sc = 2;
					for (var s in data.Planets) {
						item = data.Planets[s];
						item.id = s;

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

							if (this.playerData.Username == item.Owner)
								this.playerData.HomePlanet = item;
							else
								this.playerData.PlanetToAttack = item;

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

					this.context.spaceScene.update(renderData);
				break;
			}
  	} catch(err) {
  		console.log("###.InvalidData:", command)
  	}
  	break;
  }
}

module.exports.prototype.connect = function() {
	var self = this;

	this.sockjs = new SockJS('http://127.0.0.1:7000/universe');
	this.sockjs.onopen = function() {
		console.log('open');
	};
	
	this.sockjs.onmessage = function(e) {
    self.parseCommand(e.data);
  };

  this.sockjs.onclose = function() {
  	console.log('close');
  };
}

module.exports.prototype.renderData = function(data) {
	this.context.spaceScene.update(data);
}