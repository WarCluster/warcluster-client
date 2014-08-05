module.exports = function(context, config, controller) {
  THREE.EventDispatcher.call(this);

  config = config || {};

  this.context = context;
  this.mpos = {x: 0, y: 0};
  this.controller = controller;
  this.xMin = config.xMin || -5000000;
  this.xMax = config.xMax || 5000000;
  this.yMin = config.yMin || -4000000;
  this.yMax = config.yMax || 4000000;
  this.scaleIndex = 1;

  var self = this;
  var scrollMouseUp = function(e) {
    window.removeEventListener("mousemove", scrollMouseMove);
    window.removeEventListener("mouseup", scrollMouseUp);
    window.removeEventListener("mouseout",  scrollMouseUp);
  }

  var scrollMouseMove = function(e) {
    var dx = (self.mpos.x - e.clientX) * self.scaleIndex;
    var dy = (e.clientY - self.mpos.y) * self.scaleIndex;

    self.mpos.x = e.clientX;
    self.mpos.y = e.clientY;

    self.scroll(dx, dy, true)
  }

  this.scrollMouseDown = function(e) {
    e.preventDefault();

    self.mpos.x = e.clientX;
    self.mpos.y = e.clientY;

    window.addEventListener("mousemove", scrollMouseMove);
    window.addEventListener("mouseup", scrollMouseUp);
  }

  this.scrollFn = null;
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.scroll = function(dx, dy, animated){
  this.scrollTo(this.controller.scrollPosition.x + dx, this.controller.scrollPosition.y + dy, animated)
}

module.exports.prototype.scaledScroll = function(dx, dy, animated){
  this.scrollTo(this.controller.scrollPosition.x + (dx * this.scaleIndex), this.controller.scrollPosition.y + (dy * this.scaleIndex), animated)
}

module.exports.prototype.scrollTo = function(x, y, animated){
  if (!this.controller.setScrollPosition(x, y))
    return false;

  var self = this;

  if (animated) {
    TweenLite.to(this.context.spaceScene.camera.position, 0.5, {
      x: this.controller.scrollPosition.x, 
      y: this.controller.scrollPosition.y,
      ease: Cubic.easeOut,
      onUpdate: this.scrollFn
    });
  } else {
    this.context.camera.position.x = this.controller.scrollPosition.x;
    this.context.camera.position.y = this.controller.scrollPosition.y;
    
    this.scrollFn();
  }
}