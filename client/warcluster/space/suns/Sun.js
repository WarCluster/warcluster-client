var InteractiveObject = require("../InteractiveObject");

module.exports = function(context){
  THREE.Object3D.call(this);
  
  this.context = context;

  if (!module.exports.sphereGeometry)
    module.exports.sphereGeometry = new THREE.SphereGeometry(1, 26, 26);

  this.sun =  new THREE.Mesh(module.exports.sphereGeometry, new THREE.MeshPhongMaterial({bumpScale: 0.05, map: null, bumpMap: null}));
  this.add(this.sun); 

  this.light = new THREE.PointLight( 0xffffff, 1.5, 5000 );
  this.light.position.z = -1400;

  var sparams = { 
    map: new THREE.ImageUtils.loadTexture( '/images/lensflare0.png' ), 
    useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center,
    transparent: false, blending: THREE.AdditiveBlending,
    side:THREE.BackSide, depthWrite: false, depthTest: false
  }

 var spriteMaterial = new THREE.SpriteMaterial(sparams);
  spriteMaterial.opacity = 0.6;

  this.glow1 = new THREE.Sprite( spriteMaterial );
  this.add(this.glow1); 

  var spriteMaterial = new THREE.SpriteMaterial(sparams);
  spriteMaterial.opacity = 0.4;

  this.glow2 = new THREE.Sprite( spriteMaterial );
  this.glow2.rotation.z = Math.random() * 3.14;
  this.add(this.glow2);
}

module.exports.prototype = new InteractiveObject();
module.exports.prototype.prepare = function(data) {
  this.data = data;
  this.position.x = this.data.Position.X;
  this.position.y = this.data.Position.Y;
  this.position.z = -300;

  this.rotation.y = Math.random() * 0.5 - 0.25;

  // var colors = [0xf6ff00, 0xffe362, 0xffe362];//0x0cff00, 0xff0000, 0x00a2ff
  var color = new THREE.Color(0xf6ff00);

  //var title = "/images/suns/sun_texture" + (parseInt(Math.random() * 6)) + ".jpg";
  var bmd1 = this.context.resourcesLoader.get("/images/suns/sun_texture" + this.data.SunTextureId + ".jpg");
  var size = 320;

  this.sun.z = Math.random() * (-50);
  this.sun.material.map = bmd1;
  this.sun.material.bumpMap = bmd1;
  this.sun.material.specularMap = bmd1;
  this.sun.scale.set(size, size, size)
  this.sun.material.color = color;

  this.glow1.scale.set(size * 12, size * 12, 1.0);
  this.glow1.material.color = color;

  this.glow2.scale.set(size * 13, size * 13, 1.0);
  this.glow2.material.color = color;

  this.light.color = color;

  this.glow1.rotation = Math.random() * Math.PI;
  this.glow2.rotation = Math.random() * Math.PI;

  this.light.position.set( this.position.x, this.position.y, this.position.z );
  this.context.scene.add( this.light );

  this.activate();
}

module.exports.prototype.destroy = function() {
  this.context.scene.remove( this.light );
  this.deactivate();
}

module.exports.prototype.tick = function() {
  this.glow1.rotation += -0.0005;
  this.glow2.rotation += 0.001;

  this.glow2.scale.x = this.glow2.scale.y = 2600 + 200 * Math.sin(new Date().getTime() * 0.001);
}