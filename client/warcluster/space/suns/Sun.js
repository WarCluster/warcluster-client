var InteractiveObject = require("../InteractiveObject");

module.exports = function(context){
  THREE.Object3D.call(this);
  
  this.context = context;

  if (!module.exports.sphereGeometry)
    module.exports.sphereGeometry = new THREE.SphereGeometry(1, 26, 26);

  this.sun =  new THREE.Mesh(module.exports.sphereGeometry, new THREE.MeshPhongMaterial({bumpScale: 0.05, map: null, bumpMap: null}));
  this.add(this.sun); 

  var bmd1 = this.context.resourcesLoader.get("/images/suns/sun_texture1.jpg");
  
  this.sun.material.map = bmd1;
  this.sun.material.bumpMap = bmd1;
  this.sun.material.specularMap = bmd1;  

  //this.light = new THREE.PointLight( 0xffffff, 1.5 * this.context.globalScale, 15000 * this.context.globalScale );
  this.light = new THREE.PointLight( 0xffffff, 0.5, 3800 );
  this.light.position.z = -1400 * this.context.globalScale;

  if (!module.exports.glowMaterial1) {
    var sparams = { 
      map: new THREE.ImageUtils.loadTexture( '/images/lensflare0.png' ), 
      useScreenCoordinates: false,
      transparent: false, blending: THREE.AdditiveBlending,
      side:THREE.BackSide, depthWrite: false, depthTest: false
    }

    module.exports.glowMaterial1 = new THREE.SpriteMaterial(sparams);
    module.exports.glowMaterial1.opacity = 0.6;

    module.exports.glowMaterial2 = new THREE.SpriteMaterial(sparams);
    module.exports.glowMaterial2.opacity = 0.4;
  }

  //this.glow1 = new THREE.Sprite( module.exports.glowMaterial1 );
  //this.add(this.glow1); 

  /*this.glow2 = new THREE.Sprite( module.exports.glowMaterial2 );
  this.glow2.rotation.z = Math.random() * 3.14;
  this.add(this.glow2);*/
}

module.exports.prototype = new InteractiveObject();
module.exports.prototype.prepare = function(data) {
  this.data = data;
  this.position.x = this.data.Position.X;
  this.position.y = this.data.Position.Y;
  this.position.z = -300;

  this.rotation.y = Math.random() * 0.5 - 0.25;

  // var colors = [0xf6ff00, 0xffe362, 0xffe362];//0x0cff00, 0xff0000, 0x00a2ff
  var color = new THREE.Color(0xffe362);

  //var title = "/images/suns/sun_texture" + (parseInt(Math.random() * 6)) + ".jpg";
  var size = 320;

  this.sun.z = Math.random() * (-50);
  this.sun.scale.set(size, size, size)
  this.sun.material.color = color;

  size *= this.context.globalScale;

  //this.glow1.scale.set(size * 5, size * 5, 1.0);
  //this.glow1.material.color = color;

  //this.glow2.scale.set(size * 6, size * 6, 1.0);
 // this.glow2.material.color = color;

  this.light.color = color;

  //this.glow1.rotation = Math.random() * Math.PI;
  //this.glow2.rotation = Math.random() * Math.PI;

  this.light.position.set( this.position.x, this.position.y, this.position.z );
  this.context.scene.add( this.light );

  //this.activate();

  this.sunGlowIndex = this.context.sunsManager.addSunGlow(this.position.x, this.position.y, this.position.z, color);
}

module.exports.prototype.destroy = function() {
  this.context.scene.remove( this.light );
  this.context.sunsManager.removeSunGlow(this.sunGlowIndex);
  //this.deactivate();
}

module.exports.prototype.tick = function() {
  /*this.glow1.rotation += -0.0005;
  this.glow2.rotation += 0.001;

  this.glow2.scale.x = this.glow2.scale.y = 1600 + 200 * Math.sin(new Date().getTime() * 0.001);*/
}