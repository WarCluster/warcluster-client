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
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background1.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background3.jpg");

  this.context.resourcesLoader.loadTexture("./images/backgrounds/background5.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background6.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background7.jpg");
  this.context.resourcesLoader.loadTexture("./images/backgrounds/background8.jpg");

  this.context.resourcesLoader.loadTexture("./images/suns/sun1.png");

  this.context.resourcesLoader.loadTexture("./images/planets/planet1.png");
  this.context.resourcesLoader.loadTexture("./images/planets/planet_glow.png");
  this.context.resourcesLoader.addEventListener("complete", function() { 
    console.log("--complete--");

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
  this.camera = new THREE.PerspectiveCamera(15, ww / hh, 0.1, 100000000);
  this.camera.position.z = 6000;

  this.scene = new THREE.Scene();
  this.scene.add( new THREE.AmbientLight( 0xc1c1c1 ) );

  this.projector = new THREE.Projector();

  this.renderer = new THREE.WebGLRenderer( { antialias: true} );
  this.renderer.setSize(ww, hh);
  this.renderer.sortObjects = false
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

  var onWindowResize = function() {
     _self.camera.aspect = window.innerWidth / window.innerHeight;
     _self.camera.updateProjectionMatrix();

     _self.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);

  $(".content").append(this.renderer.domElement);
}

module.exports.prototype.getIntersectionObjects = function() {
  var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
  this.projector.unprojectVector( vector, this.camera );

  var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position ).normalize());
  var intersects = raycaster.intersectObjects(this.hitObjects);  

  return raycaster.intersectObjects(this.hitObjects);
}

module.exports.prototype.startRendering = function() {
  var _self = this;
  var render = function() {
    requestAnimationFrame(render);

    for(var i = 0;i < _self.interactiveObjects.length;i ++)
      _self.interactiveObjects[i].tick();

    _self.renderer.render(_self.scene, _self.camera);
    _self.stats.update();
  }

  render();
}

module.exports.prototype.getScreenCoordinates = function(object) {
  var scp = object.matrixWorld.getPosition().clone();
  var screenPos = object.matrixWorld.getPosition().clone();
  this.projector.projectVector( screenPos, this.camera );
  screenPos.x = ( screenPos.x + 1 ) * (ww / 2);
  screenPos.y = ( - screenPos.y + 1) * (hh / 2);

  /*var _viewProjectionMatrix = new THREE.Matrix4()
  _viewProjectionMatrix.multiply( _self.context.camera.projectionMatrix, _self.context.camera.matrixWorldInverse );

  var _frustum = new THREE.Frustum();
  _frustum.setFromMatrix( _viewProjectionMatrix );

  var modelMatrix = object.matrixWorld;
  var _vertex = new THREE.RenderableVertex();
  _vertex.positionWorld.copy( scp );

  modelMatrix.multiplyVector3( _vertex.positionWorld );

  _vertex.positionScreen.copy( _vertex.positionWorld );
  _viewProjectionMatrix.multiplyVector4( _vertex.positionScreen );

  _vertex.positionScreen.x /= _vertex.positionScreen.w;
  _vertex.positionScreen.y /= _vertex.positionScreen.w;

  _vertex.visible = _vertex.positionScreen.z > _self.context.camera.near && _vertex.positionScreen.z < _self.context.camera.far;


  console.log(_vertex);*/


  return screenPos;
}

module.exports.prototype.update = function(data) {
  //var objects
  this.clear();
  if (data.objects.length > 0) {
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
          var planet = this.context.planetsFactory.build();
          planet.position.x = obj.position.x;
          planet.position.y = obj.position.y;

          this.objects.push(planet);
        break;
      }
    }
  }
}

module.exports.prototype.clear = function() {
  var obj;
  while (this.objects.length) {
    obj = this.objects.shift();

    if (obj instanceof Sun)  
      this.context.sunsFactory.destroy(obj);
    else if (obj instanceof Planet)  
      this.context.planetsFactory.destroy(obj);
  }
}