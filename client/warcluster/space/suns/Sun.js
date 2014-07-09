var InteractiveObject = require("../InteractiveObject");

module.exports = function(context){
  THREE.Object3D.call(this);
  var _self = this;
  
  this.context = context;

  this.metaInfo = {
    timestamp: (new Date()).getTime()
  };

  

  this.sc = 250 + Math.random() * 50;

  var colors = [0x0cff00, 0xff0000, 0x00a2ff, 0xf6ff00, 0xffe362, 0xffe362];
  var color = new THREE.Color().setHex(colors[parseInt(colors.length*Math.random())]);
  var params = color == 0xffe362 ? {bumpScale: 0.05, map: null, bumpMap: null} : {bumpScale: 0.05, map: null, bumpMap: null, color: color}

  this.sun =  new THREE.Mesh(new THREE.SphereGeometry(320, 26, 26), new THREE.MeshPhongMaterial(params));
  this.add(this.sun); 
  //this.sun.visible = false;

  this.light = new THREE.PointLight( color, 1.5, 5000 );
  this.light.position.z = -1400;

  var sparams = { 
    map: new THREE.ImageUtils.loadTexture( '/images/lensflare0.png' ), 
    useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center,
    color: color || 0xffe362, transparent: false, blending: THREE.AdditiveBlending,
    side:THREE.BackSide, depthWrite: false, depthTest: false
  }

 var spriteMaterial = new THREE.SpriteMaterial(sparams);
  spriteMaterial.opacity = 0.6;

  this.glow1 = new THREE.Sprite( spriteMaterial );
  this.glow1.scale.set(3400, 3400, 1.0);
  //this.glow1.position.z = 400;
  this.add(this.glow1); // this centers the glow at the mesh

  var spriteMaterial = new THREE.SpriteMaterial(sparams);
  spriteMaterial.opacity = 0.4;

  this.glow2 = new THREE.Sprite( spriteMaterial );
  this.glow2.scale.set(2700, 2700, 1.0);
  //this.glow2.position.z = 400;
  this.glow2.rotation.z = Math.random() * 3.14;
  this.add(this.glow2);


  this.glow1.rotation = Math.random() * 314;
  this.glow2.rotation = Math.random() * 314;
}

module.exports.prototype = new InteractiveObject();
module.exports.prototype.prepare = function(data) {
  var sc = 750 + Math.random() * 250;

  this.data = data;

  this.position.x = this.data.Position.X;
  this.position.y = this.data.Position.Y;
  this.position.z = -300;

  //var title = "/images/suns/sun_texture" + (parseInt(Math.random() * 6)) + ".jpg";
  var bmd1 = this.context.resourcesLoader.get("/images/suns/sun_texture" + this.data.SunTextureId + ".jpg");

  /*this.sun.scale.x = sc;
  this.sun.scale.y = sc;
  this.sun.scale.z = sc;*/

  this.sun.z = Math.random() * (-50);
  this.sun.material.map = bmd1;
  this.sun.material.bumpMap = bmd1;
  this.sun.material.specularMap = bmd1;

  this.rotation.x = Math.random() * Math.PI;
  this.rotation.y = Math.random() * Math.PI;
  this.rotation.z = Math.random() * Math.PI;

  /*this.glow.scale.x = sc*1.5;
  this.glow.scale.y = sc*1.5;
  this.glow.scale.z = sc*1.5;*/

  this.light.position.set( this.position.x, this.position.y, this.position.z );
  this.context.scene.add( this.light );

  this.activate();
}

module.exports.prototype.destroy = function() {
  this.context.scene.remove( this.light );
  this.deactivate();
}

module.exports.prototype.tick = function() {
  //console.log("-tick-")
  //this.glow2.rotation.z += 0.001;

  this.glow1.rotation += -0.0005;
  this.glow2.rotation += 0.001;
  //this.glow1.scale.set(5, 5, 1);

  var scale = 2000 + 300 * Math.sin(new Date().getTime() * 0.002)

  this.glow2.scale.x = scale;
  this.glow2.scale.y = scale;

  //this.glow2.scale.y += 0.01;
}