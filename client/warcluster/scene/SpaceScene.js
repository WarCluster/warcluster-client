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
  this.stats.domElement.style.right = '160px';
  this.context.$content.append(this.stats.domElement);

  this.$info = $('<div style="font-size: 10px; background-color: #1111FF; padding: 2px; width: 120px" />')

  $(this.stats.domElement).append(this.$info);

  var u = this.stats.update;

  this.stats.update = function() {
    self.$info.html(
      "Obj: " + self.context.objects.length + "/" + self.context.container.children.length +
      ", Sh: "+(self.context.shipsManager ? self.context.shipsManager.objectsIndexes.length : 0) + 
      "<br/>М: "+ self.context.missions.length + 
      ", Pl: " + self.context.planetsHitObjects.length + 
      ", Sn: " + self.context.suns.length + 
      ", IO: " + self.context.interactiveObjects.length
      
    );

    return u.apply(this, arguments);
  }

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
  this.scene.add( new THREE.AmbientLight( 0xb0b0b0 ) );

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
    
    if (self.context.commandsManager.connected)
      self.context.spaceViewController.checkPosition();

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

    self.context.shipsManager.update();

    self.renderer.render(self.scene, self.camera);
    self.stats.update();

    tMax = Math.max(tMax, (new Date()).getTime() - t)
    //if (self.ctrlKey && self.spaceKey)
      //console.log("2.RenderTime:", /*(new Date()).getTime() - t, tMax, */self.context.interactiveObjects.length, self.context.objects.length, self.context.planets.length);
  }

  render();
}

module.exports.prototype.render = function(data) {
  //console.log("----- ### scene render -----------------------------------------------------");
  var t1 = new Date().getTime();
  this.gc();
  var t2 = new Date().getTime();
  for (s in data.Suns) {
    data.Suns[s].id = s;
    if (!data.Suns[s].Position) {
      data.Suns[s].Position = [data.Suns[s].Position.X, data.Suns[s].Position.Y];
    }
    
    var sun = this.context.objectsById[data.Suns[s].id];
    if (!sun)
      sun = this.context.sunsFactory.build(data.Suns[s]);
  }
  var t3 = new Date().getTime();
  this.context.planetsManager.managePlanetData(data.Planets);
  var t4 = new Date().getTime();
  for (s in data.Missions) {
    data.Missions[s].id = s;

    var mission = this.context.objectsById[data.Missions[s].id];
    if (!mission) {
      //console.log("render:", s)
      this.context.missionsFactory.build(data.Missions[s]);
    }
  }
  var t5 = new Date().getTime();

  //console.log("----- ### scene render:", new Date().getTime() - t1, t2 - t1, t3 - t2, t4 - t3, t5 - t4)
}

module.exports.prototype.gc = function() {
  var t = Date.now();
  var rect = this.context.spaceViewController.screenRect;
  var i;

  //console.log("1.-gc-", rect, this.context.objects.length)
  var forRemove = [];
  for (i = 0;i < this.context.objects.length;i ++) {
    var object = this.context.objects[i];

    if (!(object.position.x >= rect.x && object.position.x <= rect.x + rect.width &&
        object.position.y <= rect.y && object.position.y >= rect.y - rect.height))
      forRemove.push(object)
  }

  this.context.shipsManager.update();

  for (i = 0;i < this.context.missions.length;i ++)
    this.context.missions[i].removeShipsIfNecessary();

  //console.log("1.-gc-DESTROY OBJECT:", forRemove.length, this.context.objects.length)
  
  while (forRemove.length > 0) 
    this.destroyObject(forRemove.shift())

  //console.log("---------------------- GC --------------------", Date.now() - t)
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