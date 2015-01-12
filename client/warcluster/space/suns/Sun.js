module.exports = function(context){
  THREE.Object3D.call(this);
  
  this.context = context;

  if (!module.exports.sphereGeometry)
    module.exports.sphereGeometry = new THREE.SphereGeometry(1, 26, 26);

  this.sun =  new THREE.Mesh(module.exports.sphereGeometry);
  this.add(this.sun); 

  this.light = new THREE.PointLight( 0xffffff, 1.5, 5000 );
  this.light.position.z = -1400;
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(data) {
  this.data = data;
  this.position.x = this.data.Position.X;
  this.position.y = this.data.Position.Y;
  this.position.z = -300;

  this.rotation.y = Math.random() * 0.5 - 0.25;

  var color = new THREE.Color(0xffe362);
  var size = 320;

  this.sun.z = Math.random() * (-50);
  this.sun.scale.set(size, size, size)
  this.sun.material = this.context.sunsTextureManager.build(this.data);

  this.light.color = color;

  this.light.position.set( this.position.x, this.position.y, this.position.z );
  this.context.scene.add( this.light );

  this.sunGlowIndex = this.context.sunsManager.addSunGlow(this.position.x, this.position.y, this.position.z, color);
  debugger;
  console.log("this.sunGlowIndex", this.sunGlowIndex);
}

module.exports.prototype.destroy = function() {
  this.context.scene.remove( this.light );
  console.log("destroy this.sunGlowIndex", this.sunGlowIndex);
  debugger;
  this.context.sunsManager.removeSunGlow(this.sunGlowIndex);
}