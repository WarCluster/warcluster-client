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

//require("../vendor/extends");

module.exports = function(){
	var _self = this;

	this.playerData = {
		id: "-PLAYER1-"
	};

	var ww = window.innerWidth;
  var hh = window.innerHeight;

	this.context = new GameContext();
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

	this.spaceViewController = new SpaceViewController();
	this.spaceViewController.zoom = 6000;
	this.spaceViewController.maxZoom = 60000000;
	this.spaceViewController.minZoom = 6000;
	this.spaceViewController.zoomStep = 20000;

	this.spaceViewController.addEventListener("scroll", function(e) {
		TweenLite.to(_self.context.spaceScene.camera.position, 0.7, {
			x: -_self.spaceViewController.scrollPositon.x, 
			y: _self.spaceViewController.scrollPositon.y,
			ease: Cubic.easeOut
		});
	});
	this.spaceViewController.addEventListener("zoom", function(e) {
		TweenLite.to(_self.context.spaceScene.camera.position, 0.7, {
			z: _self.spaceViewController.zoom,
			ease: Cubic.easeOut
		});

		/*TweenLite.to(_self.spaceViewController, 0.7, {
			scaleIndex: _self.spaceViewController.zoom / 6000,
			ease: Cubic.easeOut
		});*/
		_self.spaceViewController.scaleIndex = _self.spaceViewController.zoom / 6000;
		

		//_self.context.spaceScene.camera.position.z += e.wheelDelta * 150;
	});


	this.spaceViewController.activate();

	/*this.selectedPlanet = null;

	var t;
		window.addEventListener("mousedown", function() {
			t = (new Date()).getTime();
		});
		window.addEventListener("click", function(e) {
			//e.preventDefault();
			if ((new Date()).getTime() - t < 200) {
				var intersects = getIntersectionObjects();
				var len = intersects.length;
				var selected = false;

				
				for (var i = 0;i < len;i ++) {
					var inters = intersects[i];

					if (inters.object.parent.data.Owner == _self.playerData.id){
						if (_self.selectedPlanet)
							_self.selectedPlanet.deselect();

						_self.selectedPlanet = intersects[0].object.parent;
						_self.selectedPlanet.select();

						getScreenCoordinates(_self.selectedPlanet);

						selected = true;
						break;
					}
				}

				if (len > 0 && !selected && _self.selectedPlanet) {
					var m = _self.context.missionsFactory.build();
					m.send([_self.selectedPlanet], intersects[0].object.parent);

					_self.context.missionsFactory.destroy(m);
				}

				//console.log(len, selected, _self.selectedPlanet);
			}
		});

		var onWindowResize = function() {
			 _self.context.camera.aspect = window.innerWidth / window.innerHeight;
			 _self.context.camera.updateProjectionMatrix();

			 _self.context.renderer.setSize( window.innerWidth, window.innerHeight );
		}

		onWindowResize();
		window.addEventListener('resize', onWindowResize, false );
		window.addEventListener('mousemove', function(e) {
			mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
			mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
		}, false);*/
}

module.exports.prototype.renderData = function(data) {
	console.log("-renderData-", data);
	this.context.spaceScene.update(data);
}