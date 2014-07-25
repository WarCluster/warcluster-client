var SpaceSceneEnviroment = require("./SpaceSceneEnviroment");
var Sun = require("../space/suns/Sun");
var Planet = require("../space/planets/Planet");
var Mission = require("../space/missions/Mission");

var resources = require("../../config/resources.js");

module.exports = function(context){
  this.context = context;
  this.interval = null;
  this.afterRenderFn = null;
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.prepare = function() {
  var self = this;

  this.stats = new Stats();
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.bottom = '0px';
  this.stats.domElement.style.right = '100px';
  this.context.$content.append(this.stats.domElement);

  for (var i = 0;i < resources.textures.length;i ++)
    this.context.resourcesLoader.loadTexture(resources.textures[i]);

  for (var i = 0;i < resources.models.length;i ++)
    this.context.resourcesLoader.loadModel(resources.models[i]);

  this.context.resourcesLoader.addEventListener("complete", function() { 
    self.buildScene();
    self.startRendering();
    self.context.planetsManager.start();
    self.dispatchEvent({type: "complete"});
  });
}

module.exports.prototype.buildScene = function() {
  var ww = window.innerWidth;
  var hh = window.innerHeight;
  var self = this;

  console.log(ww, hh);

  this.camera = new THREE.PerspectiveCamera(25, ww / hh, 0.1, 100000000);
  this.camera.position.z = 4000;

  THREE.Object3D._threexDomEvent.camera(this.camera);

  this.scene = new THREE.Scene();
  this.scene.add( new THREE.AmbientLight( 0x6e6e6e ) );

  this.projector = new THREE.Projector();

  this.renderer = new THREE.WebGLRenderer( { antialias: true} );
  this.renderer.setSize(ww, hh);
  //this.renderer.shadowMapEnabled = true;
  //this.renderer.shadowMapSoft = true;
  this.renderer.sortObjects = false
  //this.renderer.autoClear = false;

  this.container = new THREE.Object3D();
  this.scene.add(this.container);

  this.enviroment = new SpaceSceneEnviroment(this.context);
  this.container.add(this.enviroment);

  this.context.hitPlane = this.enviroment.hitPlane;

  this.context.camera = this.camera;
  this.context.scene = this.scene;
  this.context.projector = this.projector;
  this.context.renderer = this.renderer;
  this.context.container = this.container;

  this.ctrlKey = false;
  this.spaceKey = false;

  var onWindowResize = function() {
    var ww = $("body").width();
    var hh = $("body").height();
    self.camera.aspect = ww / hh;
    self.camera.updateProjectionMatrix();
    self.context.width = ww;
    self.context.height = hh;

    self.renderer.setSize( ww, hh );
    // TODO fix on resize
    /*if (self.context.commandsManager.connected)
      self.context.spaceViewController.checkPosition();*/

    self.context.spaceViewController.info.updatePosition();
  }

  this.context.$content.append(this.renderer.domElement);

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
}

module.exports.prototype.startRendering = function() {
  var self = this;
  var ct = (new Date()).getTime();
  var t = ct;
  var tMax = 0;
  var render = function() {
    requestAnimationFrame(render);

    ct = (new Date()).getTime();
    self.context.processingTime = ct - t;
    self.context.currentTime += self.context.processingTime;
    t = ct;

    for(var i = 0;i < self.context.interactiveObjects.length;i ++)
      self.context.interactiveObjects[i].tick();
    tMax = Math.max(tMax, (new Date()).getTime() - t)
    //console.log("1.RenderTime:", (new Date()).getTime() - t, tMax, self.context.interactiveObjects.length);

    t = (new Date()).getTime();

    self.renderer.render(self.scene, self.camera);
    self.stats.update();

    tMax = Math.max(tMax, (new Date()).getTime() - t)
    //if (self.ctrlKey && self.spaceKey)
      //console.log("2.RenderTime:", /*(new Date()).getTime() - t, tMax, */self.context.interactiveObjects.length, self.context.objects.length, self.context.planets.length);
  }

  render();
}

module.exports.prototype.render = function(data) {
  var t = new Date().getTime();
  this.gc();

  for (s in data.Suns) {
    data.Suns[s].id = s;
    if (!data.Suns[s].Position) {
      data.Suns[s].Position = [data.Suns[s].Position.X, data.Suns[s].Position.Y];
    }
    
    var sun = this.context.objectsById[data.Suns[s].id];
    if (!sun)
      sun = this.context.sunsFactory.build(data.Suns[s]);
  }
  this.context.planetsManager.managePlanetData(data.Planets);

  for (s in data.Missions) {
    if (!data.Missions[s].id)
      data.Missions[s].id = s;
    var mission = this.context.objectsById[data.Missions[s].id];
    if (!mission)
      this.context.missionsFactory.build(data.Missions[s]);
    else
      mission.update(data.Missions[s]);
  }

  if (this.afterRenderFn != null)
    this.afterRenderFn();

  //console.log("### scene render:", new Date().getTime() - t)
}

module.exports.prototype.gc = function() {
  var rect = this.context.spaceViewController.screenRect;
  //console.log("1.-gc-", rect, this.context.objects.length)
  var forRemove = [];
  for (var i = 0;i < this.context.objects.length;i ++) {
    var object = this.context.objects[i];

    if (!(object.position.x >= rect.x && object.position.x <= rect.x + rect.width &&
        object.position.y <= rect.y && object.position.y >= rect.y - rect.height))
      forRemove.push(object)
  }

  //console.log("1.-gc-DESTROY OBJECT:", forRemove.length, this.context.objects.length)
  
  while (forRemove.length > 0) 
    this.destroyObject(forRemove.shift())
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
      this.context.planetsFactory.destroy(obj);
  }
}

module.exports.prototype.destroyObjectByIndex = function(index) {
  this.destroyObject(this.context.objects[index])
}

module.exports.prototype.destroyObject = function(obj) {
  if (obj instanceof Sun) {
    //console.log("1.-destroyObject-", obj.data)
    this.context.sunsFactory.destroy(obj);
  } else if (obj instanceof Planet) {
    //console.log("2.-destroyObject-", obj.data)
    this.context.planetsFactory.destroy(obj);
  } else if (obj instanceof Mission) {
    //console.log("3.-destroyObject-", obj.data)
    this.context.missionsFactory.destroy(obj);
  }
}

module.exports.prototype.getMouseIntersectionObjects = function(x, y) {
  var pX = (x / window.innerWidth) * 2 - 1;
  var pY = - (y / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3( pX, pY, 0.5 );
  this.context.projector.unprojectVector( vector, this.context.camera );

  var raycaster = new THREE.Raycaster(this.context.camera.position, vector.sub(this.context.camera.position ).normalize());
  return raycaster.intersectObjects(this.context.planetsHitObjects);
}