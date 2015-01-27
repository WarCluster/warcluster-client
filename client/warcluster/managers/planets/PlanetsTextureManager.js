module.exports = function(context) {
  this.context = context;
  this.materials = {};
}

module.exports.prototype.build = function(data) {
  var color = new THREE.Color(data.Color.R, data.Color.G, data.Color.B)
  var hex = color.getHexString();

  if (!this.materials[data.Texture])
    this.materials[data.Texture] = {};

  if (this.materials[data.Texture][hex])
    return this.materials[data.Texture][hex];

  var map = this.context.resourcesLoader.get("/images/planets/planet"+data.Texture+".png");
  
  this.materials[data.Texture][hex] = new THREE.MeshPhongMaterial({
    map: map, 
    bumpMap: map, 
    bumpScale: 10,
    shininess: 5, 
    color: color, 
    ambient: color, 
    specular: 0xffffff, 
    emissive: 0x000000
  });
  
  return this.materials[data.Texture][hex];
}
