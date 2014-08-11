THREE.Vector3.prototype.rotateXY = function(angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  var x = this.x;
  var y = this.y;

  this.x = (cos * x) - (sin * y);
  this.y = (sin * x) + (cos * y);

  return this;
}