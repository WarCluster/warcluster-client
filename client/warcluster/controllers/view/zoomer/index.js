var utils = require("../../../utils")

module.exports = function(context, config){
  THREE.EventDispatcher.call(this);

  var self = this;

  this.context = context;
  this.zoomStep = config.zoomStep || 250;
  this.minZoom = config.minZoom || null;
  this.maxZoom = config.maxZoom || null;
  this.mousePosition = { x: 0, y: 0};

  

  $(window).mousewheel(function(e){
    self.zoomIt(e.deltaY > 0 ? -self.zoomStep : self.zoomStep)
  });
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.zoomIn = function() {
  this.zoomIt(-this.zoomStep);
}

module.exports.prototype.zoomOut = function() {
  this.zoomIt(this.zoomStep);
}

module.exports.prototype.zoomIt = function(step) {
  var self = this;
  if (this.minZoom != null && this.maxZoom != null) {
    if (this.zoom + step < this.minZoom)
      this.zoom = this.minZoom;
    else if (this.zoom + step > this.maxZoom)
      this.zoom = this.maxZoom;
    else
      this.zoom += step;
  } else if (this.minZoom != null && this.maxZoom == null) {
    if (this.zoom + step < this.minZoom)
      this.zoom = this.minZoom;
    else
      this.zoom += step;
  } else if (this.minZoom == null && this.maxZoom != null) {
    if (this.zoom + step > this.maxZoom)
      this.zoom = this.maxZoom;
    else
      this.zoom += step;
  } else {
    this.zoom += step;
  }

  if (this.context.spaceScene.camera.position.z == this.zoom)
    return ;

  TweenLite.to(this.context.spaceScene.camera.position, 0.5, {
    z: this.zoom,
    ease: Cubic.easeOut,
    onStart: function() {
      self.dispatchEvent({
        type: "zoom", 
        zoom: self.getZoomIndex()
      });
    },
    onComplete: function(){        
      self.dispatchEvent({
        type: "scopeOfView", 
        zoom: self.getZoomIndex()
      });
    }
  });
}

module.exports.prototype.getZoomIndex = function() {
  var p1 = utils.toScreenXY(new THREE.Vector3(this.context.camera.position.x, 0, 0), this.context.camera, this.context.$content);
  var p2 = utils.toScreenXY(new THREE.Vector3(this.context.camera.position.x + 1, 0, 0), this.context.camera, this.context.$content);
  return 1 / Math.abs(p1.x - p2.x);
}
