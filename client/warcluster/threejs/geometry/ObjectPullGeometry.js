module.exports = function() {
  THREE.Geometry.apply(this, arguments);
}

module.exports.prototype = new THREE.Geometry();
module.exports.prototype.computeBoundingSphere = function () {
  if ( this.boundingSphere === null ) {
    this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 99999999999999);
  }
}