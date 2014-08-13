var utils = require("../../../utils")

module.exports = function(context, config, controller){
  THREE.EventDispatcher.call(this);

  var self = this;

  this.context = context;
  this.zoomStep = config.zoomStep || 250;
  this.minZoom = config.minZoom || null;
  this.maxZoom = config.maxZoom || null;
  this.mousePosition = { x: 0, y: 0};
  this.controller = controller;
  this.shiftKey = false;
  this.zoomFn = null;
  this.controller.scrollPosition.z = config.zoom || 4000;
  this.context.camera.position.z = this.controller.scrollPosition.z;

  $(window).mousewheel(function(e){
    if (self.shiftKey)
      self.zoomIt(e.deltaX < 0 ? -self.zoomStep : self.zoomStep)
    else
      self.zoomTo(e)
  });
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.prepare = function() {
  var sc = 5000 * 5
  this.hitPlane =  new THREE.Mesh(new THREE.PlaneGeometry(1366 * sc, 768 * sc, 1, 1));
  this.hitPlane.visible = false;

  this.tmpObj = new THREE.Object3D();

  this.context.container.add(this.hitPlane);
  this.context.container.add(this.tmpObj);

  this.zoomFn(this.getZoomIndex())
}

module.exports.prototype.zoomIn = function() {
  this.zoomIt(-this.zoomStep);
}

module.exports.prototype.zoomOut = function() {
  this.zoomIt(this.zoomStep);
}

module.exports.prototype.zoomTo = function(e) {
  var step = e.deltaY < 0 ? -this.zoomStep : this.zoomStep;
  var dist = step > 0 ? this.controller.scrollPosition.z - this.minZoom : this.controller.scrollPosition.z - this.maxZoom;
  if (dist == 0)
    return ;

  step = Math.abs(dist) < Math.abs(step) ? dist : step;
  var intersects = utils.getMouseIntersectionObjects(e.clientX, e.clientY, [this.hitPlane], this.context)
  if (intersects.length > 0) {
    var p = intersects[0].point;
    var v = new THREE.Vector3(p.x - this.context.camera.position.x, p.y - this.context.camera.position.y, p.z - this.context.camera.position.z)
    v.normalize();
    v.multiplyScalar(step)

    if (v.z == 0 || !this.controller.addScrollPosition(v.x, v.y, v.z))
      return false;
    this.animateIt();
  }
}

module.exports.prototype.zoomIt = function(step) {
  if (!this.controller.setScrollPosition(null, null, this.controller.scrollPosition.z + step))
    return false;
  this.animateIt();
}

module.exports.prototype.zoomAt = function(z) {
  if (!this.controller.setScrollPosition(null, null, z))
    return false;
  this.animateIt();
}

module.exports.prototype.animateIt = function(time) {
  var self = this;
  TweenLite.to(this.context.spaceScene.camera.position, time || 0.5, {
    x: this.controller.scrollPosition.x,
    y: this.controller.scrollPosition.y,
    z: this.controller.scrollPosition.z,
    ease: Cubic.easeOut,
    onUpdate: function() { self.zoomFn(self.getZoomIndex()) }
  });
}

module.exports.prototype.getZoomIndex = function() {
  var p1 = utils.toScreenXY(new THREE.Vector3(this.context.camera.position.x, 0, 0), this.context.camera, this.context.$content);
  var p2 = utils.toScreenXY(new THREE.Vector3(this.context.camera.position.x + 1, 0, 0), this.context.camera, this.context.$content);
  return 1 / Math.abs(p1.x - p2.x);
}
