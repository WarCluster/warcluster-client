module.exports = function(context, config){
  THREE.EventDispatcher.call(this);

  var self = this;

  this.context = context;
  this.zoom = config.zoom || 0;
  this.zoomStep = config.zoomStep || 250;
  this.minZoom = config.minZoom || null;
  this.maxZoom = config.maxZoom || null;

  $(window).mousewheel(function(e) {
    e.preventDefault();

    var st = e.deltaY > 0 ? -self.zoomStep : self.zoomStep;

    if (self.minZoom != null && self.maxZoom != null) {
      if (self.zoom + st < self.minZoom)
        self.zoom = self.minZoom;
      else if (self.zoom + st > self.maxZoom)
        self.zoom = self.maxZoom;
      else
        self.zoom += st;
    } else if (self.minZoom != null && self.maxZoom == null) {
      if (self.zoom + st < self.minZoom)
        self.zoom = self.minZoom;
      else
        self.zoom += st;
    } else if (self.minZoom == null && self.maxZoom != null) {
      if (self.zoom + st > self.maxZoom)
        self.zoom = self.maxZoom;
      else
        self.zoom += st;
    } else {
      self.zoom += st;
    }

    TweenLite.to(self.context.spaceScene.camera.position, 0.7, {
      z: self.zoom,
      ease: Cubic.easeOut,
      onUpdate: function() {
        self.dispatchEvent({
          type: "zoom", 
          zoom: self.zoom
        });
      }
    });

    self.dispatchEvent({type: "zoom", wheelDelta: st, zoom: self.zoom});
  });
}

module.exports.prototype = new THREE.EventDispatcher();