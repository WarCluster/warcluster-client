module.exports = function(context, config){
  THREE.EventDispatcher.call(this);

  var self = this;

  this.context = context;
  this.zoom = config.zoom || 0;
  this.zoomStep = config.zoomStep || 250;
  this.minZoom = config.minZoom || null;
  this.maxZoom = config.maxZoom || null;
  this.mousePosition = { x: 0, y: 0};

  $(window).mousewheel(function(e) {
    e.preventDefault();

    var st = e.deltaY > 0 ? -self.zoomStep : self.zoomStep;
    var zoomMode = e.deltaY > 0 ? "zoomin" : "zoomout";
    self.mousePosition.x = (zoomMode === "zoomin") ? e.clientX : 0;
    self.mousePosition.y = (zoomMode === "zoomin") ? e.clientY : 0;

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

    TweenLite.to(self.context.spaceScene.camera.position, 0.5, {
      z: self.zoom,
      ease: Cubic.easeOut,
      onStart: function() {
        self.dispatchEvent({
          type: "zoom", 
          zoom: self.zoom,
          mode: zoomMode
        });
      }
    });
  });
}

module.exports.prototype = new THREE.EventDispatcher();