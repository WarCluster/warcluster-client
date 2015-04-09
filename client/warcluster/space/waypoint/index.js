module.exports = function(context){
  THREE.Object3D.call(this);

  this.context = context;

  if (!module.exports.planeGeometry)
    module.exports.planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);

  var color = new THREE.Color(0x008efc);
  var map = this.context.resourcesLoader.get("/images/ui/pilots_per_mission_selected.png");
  var spriteMaterial = new THREE.SpriteMaterial({ map: map, color: color, transparent: true, useScreenCoordinates: false });

  this.waypoint = new THREE.Sprite( spriteMaterial );
  this.waypoint.scale.set(350, 350);
  this.add(this.waypoint);

  this.numberTexture = new THREE.DataTexture();

  this.numberMaterial = new THREE.MeshBasicMaterial({ map: this.numberTexture, transparent: true, ambient: color, color: color});
  this.number = new THREE.Mesh(module.exports.planeGeometry, this.numberMaterial);

  this.add(this.number);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.prepare = function(position, num) {
  this.position.x = position.x;
  this.position.y = position.y;

  var result = this.context.canvasTextFactory.buildUint8Array(num, null, 55);
  this.numberTexture.image.data = new Uint8Array(result.context2d.getImageData(0, 0, result.canvas2d.width, result.canvas2d.height).data.buffer);
  this.numberTexture.image.width = result.canvas2d.width;
  this.numberTexture.image.height = result.canvas2d.height;

  this.numberMaterial.map.needsUpdate = true;

  this.number.scale.x = result.canvas2d.width;
  this.number.scale.y = result.canvas2d.height;
}