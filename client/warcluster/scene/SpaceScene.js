var SpaceSceneEnviroment = require("./SpaceSceneEnviroment");
var Sun = require("../space/suns/Sun");
var Planet = require("../space/planets/Planet");

module.exports = function(context){
  this.context = context;
  this.afterRenderFn = null;
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


  this.context.resourcesLoader.loadTexture("./images/planets/planet_selection_glow.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet_support_glow.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet_attack_glow.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet_hover_glow.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet_spy_glow.png");

  this.context.resourcesLoader.loadModel("./models/ship1.js");
  this.context.resourcesLoader.loadModel("./models/ship2.js");
  this.context.resourcesLoader.loadModel("./models/ship3.js");
  this.context.resourcesLoader.loadModel("./models/ship4.js");

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

  THREE.Object3D._threexDomEvent.camera(this.camera);

  this.scene = new THREE.Scene();
  this.scene.add( new THREE.AmbientLight( 0xb0b0b0 ) );

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

  this.ctrlKey = false;
  this.spaceKey = false;
  $(document).keydown(function(e){
    switch (e.keyCode) {
      case 32:
        self.spaceKey = true;
      break;
      case 17:
        self.ctrlKey = true;
      break;
    }
  });

  $(document).keyup(function(e){
    switch (e.keyCode) {
      case 32:
        self.spaceKey = false;
      break;
      case 17:
        self.ctrlKey = false;
      break;
    }
  });


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
  var ct = (new Date()).getTime();
  var t = ct;
  var render = function() {
    requestAnimationFrame(render);

    ct = (new Date()).getTime();
    self.context.currentTime += ct - t;
    t = ct;

    for(var i = 0;i < self.context.interactiveObjects.length;i ++)
      self.context.interactiveObjects[i].tick();

    self.renderer.render(self.scene, self.camera);
    self.stats.update();

    if (self.ctrlKey && self.spaceKey)
      console.log("RenderTime:", (new Date()).getTime() - t, self.context.interactiveObjects.length);
  }

  render();
}

module.exports.prototype.render = function(data) {
  if (data.objects.length > 0) {
    //this.clear();
    for (var i = 0;i < data.objects.length;i ++) {
      var obj = data.objects[i];
      switch (obj.xtype) {
        case "SUN":
          var sun = this.context.objectsById[obj.sunData.id];

          if (!sun)
            sun = this.context.sunsFactory.build(obj);
        break;
        case "PLANET":
          var planet = this.context.objectsById[obj.planetData.id];

          if (!planet)
            planet = this.context.planetsHitObjectsFactory.build(obj);
          else
            planet.update(obj);
        break;
      }
    }
  }

  for (var i = 0;i < data.missions.length;i ++) {
    var mission = this.context.objectsById[data.missions[i].id];
    this.context.currentTime =  data.missions[i].CurrentTime;
    
    if (!mission)
      this.context.missionsFactory.build(data.missions[i]);
    else
      mission.update(data.missions[i]);
  }

  if (this.afterRenderFn != null)
    this.afterRenderFn();
}

module.exports.prototype.moveTo = function(x, y) {
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