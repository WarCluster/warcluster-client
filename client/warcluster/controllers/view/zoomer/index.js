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

  this.controller.scrollPosition.z = config.zoom || 4000;

  $(window).mousewheel(function(e){
    if (self.shiftKey)
      self.zoomIt(e.deltaX < 0 ? -self.zoomStep : self.zoomStep)
    else
      self.zoomTo(e)
  });
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.prepare = function() {
  this.context.camera.position.z = this.controller.scrollPosition.z;
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
  var intersects = utils.getMouseIntersectionObjects(e.clientX, e.clientY, [this.controller.hitPlane], this.context)
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

module.exports.prototype.animateIt = function() {
  var self = this;
  TweenLite.to(this.context.spaceScene.camera.position, 0.5, {
    x: this.controller.scrollPosition.x,
    y: this.controller.scrollPosition.y,
    z: this.controller.scrollPosition.z,
    ease: Cubic.easeOut,
    onUpdate: function() {
      self.dispatchEvent({
        type: "zoom", 
        zoom: self.getZoomIndex()
      });
    }/*,
    onComplete: function(){        
      self.dispatchEvent({
        type: "zoom", 
        zoom: self.getZoomIndex()
      });
    }*/
  });
}

module.exports.prototype.getZoomIndex = function() {
  var p1 = utils.toScreenXY(new THREE.Vector3(this.context.camera.position.x, 0, 0), this.context.camera, this.context.$content);
  var p2 = utils.toScreenXY(new THREE.Vector3(this.context.camera.position.x + 1, 0, 0), this.context.camera, this.context.$content);
  return 1 / Math.abs(p1.x - p2.x);
}
