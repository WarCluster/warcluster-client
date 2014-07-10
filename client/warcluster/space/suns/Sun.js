module.exports = function(context){
  THREE.Object3D.call(this);
  var _self = this;
  
  this.context = context;

  this.metaInfo = {
    timestamp: (new Date()).getTime()
  };

  this.light = new THREE.PointLight( 0xfffdbd, 1.5, 5000 );

  this.sun =  new THREE.Mesh(new THREE.PlaneGeometry(225, 225, 1, 1), new THREE.MeshBasicMaterial({map: null, transparent : true}));
  this.add(this.sun);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(data) {
  var sc = 2.6 + Math.random() * 0.4 + 1;

  this.data = data;

  this.position.x = this.data.Position.X;
  this.position.y = this.data.Position.Y;
  this.position.z = -1000;

  this.sun.scale.x = sc;
  this.sun.scale.y = sc;
  this.sun.z = Math.random() * (-50);
  this.sun.material.map = this.context.resourcesLoader.get("/images/suns/sun" + this.data.SunTextureId + ".png");

  this.light.position.set( this.position.x, this.position.y, 0 );
  this.context.scene.add( this.light );
}

module.exports.prototype.destroy = function() {
  this.context.scene.remove( this.light );
}