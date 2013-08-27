module.exports = function(context, data){
  THREE.Object3D.call(this);
}

module.exports.prototype = new THREE.Object3D();
module.exports.prototype.activate = function() {
  var index = this.context.interactiveObjects.indexOf(this);
  if (index == -1)
    this.context.interactiveObjects.push(this);
}

module.exports.prototype.deactivate = function() {
  var index = this.context.interactiveObjects.indexOf(this);
  if (index != -1)
    this.context.interactiveObjects.splice(index, 1);
}