var SpaceSceneEnviroment = require("./SpaceSceneEnviroment");
var Sun = require("../suns/Sun");
var Planet = require("../planets/Planet");

module.exports = function(context){
  this.context = context;
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.prepare = function() {
  var _self = this;

  this.stats = new Stats();
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.top = '20px';
  this.stats.domElement.style.left = '50px';
  $(".content").append(this.stats.domElement);

  this.context.resourcesLoader.loadTexture("./images/ships/ship1.png");
  this.context.resourcesLoader.loadTexture("./images/ships/ship2.png");
  this.context.resourcesLoader.loadTexture("./images/ships/ship3.png");
  this.context.resourcesLoader.loadTexture("./images/ships/ship4.png");

  this.context.resourcesLoader.loadTexture("./images/backgrounds/background5.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background6.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background7.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background8.jpg");
  this.context.resourcesLoader.loadTexture("./images/suns/sun1.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet0.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet1.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet2.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet3.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet4.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet5.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet6.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet7.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet8.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet9.png");


  //this.context.resourcesLoader.loadModel("./models/logo.js");

  this.context.resourcesLoader.addEventListener("complete", function() { 
    _self.buildScene();
    _self.startRendering();
    _self.dispatchEvent({type: "complete"});
  });
}

module.exports.prototype.buildScene = function() {
  var ww = window.innerWidth;
  var hh = window.innerHeight;
  var _self = this;

  console.log(ww, hh);

  this.objects = [];
  this.planets = [];
  this.camera = new THREE.PerspectiveCamera(15, ww / hh, 0.1, 100000000);
  this.camera.position.z = 6000;

  this.scene = new THREE.Scene();
  this.scene.add( new THREE.AmbientLight( 0xc1c1c1 ) );


  var light = new THREE.SpotLight( 0xc3bc83, 1.5 );
  light.position.set( 0, 500, 2000 );
  light.castShadow = true;
  light.intensity = 1.5;

  light.shadowCameraNear = 200;
  light.shadowCameraFar = this.camera.far;
  light.shadowCameraFov = 50;

  light.shadowBias = -0.00022;
  light.shadowDarkness = 0.5;

  light.shadowMapWidth = 2048;
  light.shadowMapHeight = 2048;

  this.scene.add( light );

  this.projector = new THREE.Projector();

  this.renderer = new THREE.WebGLRenderer( { antialias: true} );
  this.renderer.setSize(ww, hh);
  //this.renderer.sortObjects = false
  //this.renderer.autoClear = false;

  this.container = new THREE.Object3D();
  this.scene.add(this.container);

  this.enviroment = new SpaceSceneEnviroment(this.context);
  this.container.add(this.enviroment);

  this.hitObjects = [];
  this.interactiveObjects = [];

  this.context.camera = this.camera;
  this.context.scene = this.scene;
  this.context.projector = this.projector;
  this.context.renderer = this.renderer;
  this.context.container = this.container;
  this.context.hitObjects = this.hitObjects;
  this.context.interactiveObjects = this.interactiveObjects;  

  /*var data = this.context.resourcesLoader.get("./models/logo.js");
  var logo = new THREE.Mesh(data.geometry, new THREE.MeshFaceMaterial( data.materials ));
  this.container.add( logo );
  console.log("logo:", logo, data);*/
  
  var onWindowResize = function() {
    //var ww = $(".content").offsetWidth;
    //var hh = $(".content").offsetHeight;
     _self.camera.aspect = window.innerWidth / window.innerHeight;
     _self.camera.updateProjectionMatrix();

     _self.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);

  $(".content").append(this.renderer.domElement);
}

module.exports.prototype.startRendering = function() {
  var _self = this;
  var render = function() {
    requestAnimationFrame(render);

    for(var i = 0;i < _self.interactiveObjects.length;i ++)
      _self.interactiveObjects[i].tick();

    _self.renderer.render(_self.scene, _self.camera);
    _self.stats.update();
    _self.context.currentTime = (new Date()).getTime();
  }

  render();
}

module.exports.prototype.update = function(data) {
  console.log("1.update:", data);
  

  if (data.objects.length > 0) {
    this.clear();
    for (var i = 0;i < data.objects.length;i ++) {
      var obj = data.objects[i];
      switch (obj.xtype) {
        case "SUN":
          var sun = this.context.sunsFactory.build();
          sun.position.x = obj.position.x;
          sun.position.y = obj.position.y;

          this.objects.push(sun);
        break;
        case "PLANET":
          var planet = this.context.planetsFactory.build(obj);
          planet.position.x = obj.position.x;
          planet.position.y = obj.position.y;

          this.objects.push(planet);
          this.planets.push(planet);
        break;
      }
    }
  }

  if (data.missions.length > 0) {
    for (var i = 0;i < data.missions.length;i ++) {

      var pl = [].concat(this.planets);
      var sr = pl.splice(parseInt(pl.length * Math.random()), 1)[0];
      var tr = pl.splice(parseInt(pl.length * Math.random()), 1)[0];
      var mission = data.missions[i];
      mission.startTime = this.context.currentTime;
      mission.travelTime = 1000 * 5;
      mission.source.position.x = sr.position.x;
      mission.source.position.y = sr.position.y;

      mission.target.position.x = tr.position.x;
      mission.target.position.y = tr.position.y;
      
      this.context.missionsFactory.build(mission);
    }
  }
}

module.exports.prototype.moveTo = function(x, y) {
  this.camera.position.x = x;
  this.camera.position.y = y;
}

module.exports.prototype.clear = function() {
  var obj;
  this.planets = [];
  while (this.objects.length) {
    obj = this.objects.shift();

    if (obj instanceof Sun)  
      this.context.sunsFactory.destroy(obj);
    else if (obj instanceof Planet)  
      this.context.planetsFactory.destroy(obj);
  }
}