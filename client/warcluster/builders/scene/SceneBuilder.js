//var Selection = require("./selection/Selection");
var SpaceViewController = require("./controllers/view/SpaceViewController");
var GameContext = require("./data/GameContext");

var Planet = require("./planets/Planet");

var PlanetsFactory = require("./factories/planets/PlanetsFactory");
var MissionsFactory = require("./factories/missions/MissionsFactory");
var ShipsFactory = require("./factories/ships/ShipsFactory");
var CanvasTextFactory = require("./factories/text/CanvasTextFactory");

//require("../vendor/extends");

module.exports = function(context){
	var _self = this;

	this.context = context;


	this.build = function() {
		var _self = this;
		var mouse = { x: 0, y: 0 };

		var bgd1 = this.context.resourcesLoader.get("./images/backgrounds/background1.jpg");
		var bgd2 = this.context.resourcesLoader.get("./images/backgrounds/background3.jpg");

		var i;

		// stars
		var radius = 100000;
		var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

		for ( i = 0; i < 250; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1;
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			vertex.multiplyScalar( r );

			starsGeometry[ 0 ].vertices.push( vertex );

		}

		for ( i = 0; i < 1500; i ++ ) {

			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1;
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			vertex.multiplyScalar( r );

			starsGeometry[ 1 ].vertices.push( vertex );

		}

		var stars;
		var starsMaterials = [
			new THREE.ParticleBasicMaterial( { color: 0xececec, size: 2, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0xececec, size: 1, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0xdbdbdb, size: 2, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0xdbdbdb, size: 1, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0xbfbfbf, size: 2, sizeAttenuation: false } ),
			new THREE.ParticleBasicMaterial( { color: 0xbfbfbf, size: 1, sizeAttenuation: false } )
		];

		for ( i = 10; i < 30; i ++ ) {

			stars = new THREE.ParticleSystem( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

			stars.rotation.x = Math.random() * 6;
			stars.rotation.y = Math.random() * 6;
			stars.rotation.z = Math.random() * 6;

			stars.position.z = -1000;

			s = i * 10;
			stars.scale.set( s, s, s );

			stars.matrixAutoUpdate = false;
			stars.updateMatrix();

			this.context.scene.add( stars );

		}
		
		var sc = 5000;
		var bg;
		

		for(i = 0;i <4; i ++) {
			var bgd = this.context.resourcesLoader.get("./images/backgrounds/background" + (i + 5) + ".jpg");

			//var mat = new THREE.MeshBasicMaterial({map: bgd2, useScreenCoordinates: false, depthTest: true, sizeAttenuation: false, transparent : true});
			var mat = new THREE.MeshBasicMaterial({map: bgd, transparent : true});
			mat.opacity = 0.2;

			var mesh =  new THREE.Mesh(new THREE.PlaneGeometry(1366 * sc, 768 * sc, 1, 1), mat);
			mesh.position.z = -5000000;

			this.backgrounds2.push(mesh);
			this.container.add(this.backgrounds2[i]);
		}

		this.backgrounds2[0].position.x = -1366 * sc / 2;
		this.backgrounds2[0].position.y = 768 * sc / 2;

		this.backgrounds2[1].position.x = 1366 * sc / 2;
		this.backgrounds2[1].position.y = 768 * sc / 2;

		this.backgrounds2[2].position.x = -1366 * sc / 2;
		this.backgrounds2[2].position.y = -768 * sc / 2;

		this.backgrounds2[3].position.x = 1366 * sc / 2;
		this.backgrounds2[3].position.y = -768 * sc / 2;



		for(i = 0;i < _self.totalPlanets;i ++) {
			var planet = this.context.planetsFactory.build();
			planet.position.set((Math.random() * 1366 - 1366/2) * 2.5, (Math.random() * 768 - 768/2) * 2.5, 10);
			planet.data.Owner = i == _self.totalPlanets - 1 ? _self.playerData.id : null;
		}

		var getIntersectionObjects = function() {
			var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	    _self.context.projector.unprojectVector( vector, _self.context.camera );

	    console.log("getIntersectionObjects", vector);

	    var raycaster = new THREE.Raycaster(_self.context.camera.position, vector.sub(_self.context.camera.position ).normalize());
			var intersects = raycaster.intersectObjects(_self.context.hitObjects);	

			console.log("getIntersectionObjects", _self.context.hitObjects.length, intersects.length, mouse);

			return intersects;
		}

		var t;
		window.addEventListener("mousedown", function() {
			t = (new Date()).getTime();
		});
		window.addEventListener("click", function() {
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

						selected = true;
						break;
					}
				}

				if (len > 0 && !selected && _self.selectedPlanet) {
					var m = _self.context.missionsFactory.build();
					m.send([_self.selectedPlanet], intersects[0].object.parent);

					_self.context.missionsFactory.destroy(m);
				}

				console.log(len, selected, _self.selectedPlanet);
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
		}, false);

		var render = function() {
		    requestAnimationFrame(render);

		    for(var i = 0;i < _self.interactiveObjects.length;i ++)
				_self.interactiveObjects[i].tick();

		    _self.context.renderer.render(_self.context.scene, _self.context.camera);
		    _self.stats.update();
	    }

	    render();
	}
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.prepareScene = function() {
	var _self = this;

	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '20px';
	this.stats.domElement.style.left = '50px';
	$(".content").append(this.stats.domElement);
	$(".content").append(this.context.renderer.domElement);

	var ships = ["./images/ships/ship1.png",
				"./images/ships/ship2.png"
				"./images/ships/ship3.png",
				"./images/ships/ship4.png",];
 	this.context.resourcesLoader.loadTexture.apply(this, ships);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/backgrounds/background1.jpg"]);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/backgrounds/background3.jpg"]);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/backgrounds/background5.jpg"]);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/backgrounds/background6.jpg"]);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/backgrounds/background7.jpg"]);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/backgrounds/background8.jpg"]);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/planets/planet1.png"]);
	this.context.resourcesLoader.loadTexture.apply(this, ["./images/planets/planet_glow.png"]);
	this.context.resourcesLoader.addEventListener("complete", function() { 
		console.log("--complete--");
		_self.dispatchEvent({type: "resources"});

		_self.buildScene();
		_self.buildEnviroment();

		_self.dispatchEvent({type: "complete"});
	});
}

module.exports.prototype.buildScene = function() {
	var ww = window.innerWidth;
	var hh = window.innerHeight;
	var _self = this;

	console.log("-buildScene-" ww, hh);

	this.context.camera = new THREE.PerspectiveCamera(15, ww / hh, 0.1, 100000000);
	this.context.camera.position.z = 6000;

	this.context.scene = new THREE.Scene();
	this.context.scene.add( new THREE.AmbientLight( 0xc1c1c1 ) );

	this.context.projector = new THREE.Projector();

	this.context.renderer = new THREE.WebGLRenderer( { antialias: true} );
	this.context.renderer.setSize(ww, hh);
	this.context.renderer.sortObjects = false
	//this.context.renderer.autoClear = false;

	this.container = new THREE.Object3D();
	this.context.scene.add(this.container);

	this.context.container = this.container;

	var onWindowResize = function() {
		 _self.context.camera.aspect = window.innerWidth / window.innerHeight;
		 _self.context.camera.updateProjectionMatrix();

		 _self.context.renderer.setSize( window.innerWidth, window.innerHeight );
	}

	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);
}

module.exports.prototype.buildEnviroment = function() {
	var _self = this;
	var mouse = { x: 0, y: 0 };

	var bgd1 = this.context.resourcesLoader.get("./images/backgrounds/background1.jpg");
	var bgd2 = this.context.resourcesLoader.get("./images/backgrounds/background3.jpg");

	var i;

	// stars
	var radius = 100000;
	var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

	for ( i = 0; i < 250; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );

		starsGeometry[ 0 ].vertices.push( vertex );

	}

	for ( i = 0; i < 1500; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2 - 1;
		vertex.y = Math.random() * 2 - 1;
		vertex.z = Math.random() * 2 - 1;
		vertex.multiplyScalar( r );
		
		starsGeometry[ 1 ].vertices.push( vertex );

	}

	var stars;
	var starsMaterials = [
		new THREE.ParticleBasicMaterial( { color: 0xececec, size: 2, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0xececec, size: 1, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0xdbdbdb, size: 2, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0xdbdbdb, size: 1, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0xbfbfbf, size: 2, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0xbfbfbf, size: 1, sizeAttenuation: false } )
	];

	for ( i = 10; i < 30; i ++ ) {

		stars = new THREE.ParticleSystem( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

		stars.rotation.x = Math.random() * 6;
		stars.rotation.y = Math.random() * 6;
		stars.rotation.z = Math.random() * 6;

		//stars.position.z = -1000;

		s = i * 10;
		stars.scale.set( s, s, s );

		stars.matrixAutoUpdate = false;
		stars.updateMatrix();

		this.context.scene.add( stars );

	}
	
	var sc = 5000;
	var bg;
	
	var backgrounds = [];

	for(i = 0;i < 4; i ++) {
		var bgd = this.context.resourcesLoader.get("./images/backgrounds/background" + (i + 5) + ".jpg");
		var mat = new THREE.MeshBasicMaterial({map: bgd, transparent : true});
		mat.opacity = 0.2;

		var mesh =  new THREE.Mesh(new THREE.PlaneGeometry(1366 * sc, 768 * sc, 1, 1), mat);
		mesh.position.z = -5000000;

		backgrounds.push(mesh);
		this.container.add(backgrounds[i]);
	}

	backgrounds[0].position.x = -1366 * sc / 2;
	backgrounds[0].position.y = 768 * sc / 2;

	backgrounds[1].position.x = 1366 * sc / 2;
	backgrounds[1].position.y = 768 * sc / 2;

	backgrounds[2].position.x = -1366 * sc / 2;
	backgrounds[2].position.y = -768 * sc / 2;

	backgrounds[3].position.x = 1366 * sc / 2;
	backgrounds[3].position.y = -768 * sc / 2;
}