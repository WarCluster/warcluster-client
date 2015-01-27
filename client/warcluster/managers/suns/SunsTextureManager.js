module.exports = function(context) {
  this.context = context;
  this.materials = {};
}

module.exports.prototype.build = function(data) {
  if (this.materials[data.SunTextureId])
    return this.materials[data.SunTextureId];

  var map = this.context.resourcesLoader.get("/images/suns/sun_texture"+data.SunTextureId+".jpg");
  
  this.materials[data.SunTextureId] = new THREE.MeshPhongMaterial({
    map: map, 
  })

  return this.materials[data.SunTextureId];
}
