module.exports = function(context){
  THREE.Object3D.call(this);

  this.context = context;

  if (!module.exports.planeGeometry)
    module.exports.planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);

  var map = this.context.resourcesLoader.get("/images/waypoint.png");
  /*this.waypoint = new THREE.Mesh(module.exports.planeGeometry, new THREE.MeshBasicMaterial({
    map: map, transparent : true
  }));
  this.waypoint.scale.set(120, 120)
  this.add(this.waypoint);*/


  var spriteMaterial = new THREE.SpriteMaterial({ 
    map: map, 
    useScreenCoordinates: false, alignment: THREE.SpriteAlignment.center,
    color: 0xFFFFFF, transparent: false
  });

  this.waypoint = new THREE.Sprite( spriteMaterial );
  this.waypoint.scale.set(120, 120);
  this.add(this.waypoint);
}

module.exports.prototype = new THREE.Object3D();