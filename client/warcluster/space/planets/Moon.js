module.exports = function(context){
  THREE.Object3D.call(this);
  
  this.selected = false;
  this.context = context;

  if (!module.exports.sphereGeometry)
    module.exports.sphereGeometry = new THREE.SphereGeometry(1, 12, 12);


  var bmd1 = this.context.resourcesLoader.get("/images/planets/planet"+parseInt(Math.random() * 27)+".png");
  var size = 10 + Math.random() * 10;

  this.moon =  new THREE.Mesh(module.exports.sphereGeometry, new THREE.MeshPhongMaterial({map: bmd1, bumpMap: bmd1, umpScale: 10,shininess: 5, color: 0xFFFFFF, ambient: 0xFFFFFF, specular: 0xffffff, emissive: 0x000000}));
  this.moon.scale.set(size, size, size);
  this.add(this.moon);  
}

module.exports.prototype = new THREE.Object3D();