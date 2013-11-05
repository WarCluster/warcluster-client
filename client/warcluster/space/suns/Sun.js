module.exports = function(context, data){
  THREE.Object3D.call(this);
  var _self = this;

  this.sc = 2.6 + Math.random() * 0.4 + 1;
  this.context = context;
  this.data = data;

  this.position.x = data.Coords[0];
  this.position.y = data.Coords[1];
  this.position.z = -1000;

  this.light = new THREE.PointLight( 0xfffdbd, 1.5, 5000 );
  this.light.position.set( data.Coords[0], data.Coords[1], 0 );
  this.context.scene.add( this.light );

  var bmd1 = context.resourcesLoader.get("./images/suns/sun1.png");

  this.sunMaterial = new THREE.MeshBasicMaterial({map: bmd1, transparent : true});
  this.sun =  new THREE.Mesh(new THREE.PlaneGeometry(225, 225, 1, 1), this.sunMaterial);
  this.sun.scale.x = this.sc;
  this.sun.scale.y = this.sc;
  this.sun.z = Math.random() * (-50);

  this.add(this.sun);
}

module.exports.prototype = new THREE.Object3D();
