var SpaceSceneEnviroment = require("./SpaceSceneEnviroment");
var Sun = require("../suns/Sun");
var Planet = require("../planets/Planet");

module.exports = function(context){
  this.context = context;
  this.afterUpdateFn = null;
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.prepare = function() {
  var self = this;

  this.stats = new Stats();
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.top = '20px';
  this.stats.domElement.style.right = '50px';
  this.context.$content.append(this.stats.domElement);

  this.context.resourcesLoader.loadTexture("./images/ships/ship1.png");

  this.context.resourcesLoader.loadTexture("./images/backgrounds/background5.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background6.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background7.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background8.jpg");
  this.context.resourcesLoader.loadTexture("./images/suns/sun1.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet1.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet_selection_glow.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet_attack_glow.png");

  this.context.resourcesLoader.addEventListener("complete", function() { 
    self.buildScene();
    self.startRendering();
    self.dispatchEvent({type: "complete"});
  });
}

module.exports.prototype.buildScene = function() {
  var ww = window.innerWidth;
  var hh = window.innerHeight;
  var self = this;

  console.log(ww, hh);

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

  this.context.camera = this.camera;
  this.context.scene = this.scene;
  this.context.projector = this.projector;
  this.context.renderer = this.renderer;
  this.context.container = this.container;

  THREE.Object3D._threexDomEvent.camera(this.camera);

  var onWindowResize = function() {
    //var ww = $(".content").offsetWidth;
    //var hh = $(".content").offsetHeight;
     self.camera.aspect = window.innerWidth / window.innerHeight;
     self.camera.updateProjectionMatrix();

     self.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);

  $(".content").append(this.renderer.domElement);
}

module.exports.prototype.startRendering = function() {
  var self = this;
  var t = (new Date()).getTime();
  var render = function() {
    requestAnimationFrame(render);

    for(var i = 0;i < self.context.interactiveObjects.length;i ++)
      self.context.interactiveObjects[i].tick();

    self.renderer.render(self.scene, self.camera);
    self.stats.update();
    self.context.currentTime += (new Date()).getTime() - t;
    t = (new Date()).getTime();
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
          var sun = this.context.sunsFactory.build(obj);
          this.context.objects.push(sun);
        break;
        case "PLANET":
          var planet = this.context.planetsHitObjectsFactory.build(obj);
        break;
      }
    }
  }

  if (data.missions.length > 0) {
    for (var i = 0;i < data.missions.length;i ++) {

      var pl = [].concat(this.context.planetsHitObjects);
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

  if (this.afterUpdateFn != null)
    this.afterUpdateFn();
}

module.exports.prototype.moveTo = function(x, y) {
  this.camera.position.x = x;
  this.camera.position.y = y;
}

module.exports.prototype.attack = function(x, y) {
  this.camera.position.x = x;
  this.camera.position.y = y;
}

module.exports.prototype.clear = function() {
  var obj;
  this.context.objects = [];
  this.context.planetsHitObjects = [];

  while (this.context.interactiveObjects.length) {
    obj = this.context.interactiveObjects.shift();

    if (obj instanceof Sun)  
      this.context.sunsFactory.destroy(obj);
    else if (obj instanceof Planet)  
      this.context.planetsHitObjectsFactory.destroy(obj);
  }
}