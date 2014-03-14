module.exports = function(context){
  THREE.Object3D.call(this);
  var _self = this;

  this.context = context;
  this.light = new THREE.PointLight( 0xfffdbd, 1.5, 5000 );

  var material = new THREE.MeshBasicMaterial({transparent : true});
  this.sun =  new THREE.Mesh(new THREE.PlaneGeometry(225, 225, 1, 1), material);
  this.add(this.sun);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(data) {
  this.sc = 2.6 + Math.random() * 0.4 + 1;
  this.data = data;

  this.position.x = data.Position.X;
  this.position.y = data.Position.Y;

  this.sun.material.map = this.context.resourcesLoader.get("/images/suns/sun" + data.SunTextureId + ".png");
  this.sun.scale.x = this.sc;
  this.sun.scale.y = this.sc;
  //this.sun.z = Math.random() * (-50);

  this.light.position.set( this.position.x, this.position.y, 0 );
}

module.exports.prototype.remove = function() {
  this.context.scene.remove( this.light );
  return this;
}