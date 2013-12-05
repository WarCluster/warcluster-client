module.exports = function(context, config) {
  THREE.EventDispatcher.call(this);

  config = config || {};

  this.context = context;
  this.mpos = {x: 0, y: 0};
  this.scrollPositon = {x: 0, y: 0};
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
    var dx = self.scrollPositon.x + (e.clientX * self.scaleIndex - self.mpos.x);
    var dy = self.scrollPositon.y + (e.clientY * self.scaleIndex - self.mpos.y);

    self.setScrollPosition(dx, dy);

    self.mpos.x = e.clientX * self.scaleIndex;
    self.mpos.y = e.clientY * self.scaleIndex;

    TweenLite.to(self.context.spaceScene.camera.position, 0.7, {
      x: -self.scrollPositon.x, 
      y: self.scrollPositon.y,
      ease: Cubic.easeOut,
      onUpdate: function() {
        self.dispatchEvent({
          type: "scroll", 
          objects: self.selectedPlanets
        });
      }
    });
  }

  this.setScrollPosition = function(dx, dy) {
     if (dx < self.xMin)
      self.scrollPositon.x = self.xMin;
    else if (dx > self.xMax)
      self.scrollPositon.x = self.xMax;
    else
      self.scrollPositon.x = dx;
      
    if (dy < self.yMin)
      self.scrollPositon.y = self.yMin;
    else if (dy > self.yMax)
      self.scrollPositon.y = self.yMax;
    else
      self.scrollPositon.y = dy;
  }
  
  this.scrollMouseDown = function(e) {
    e.preventDefault();

    self.mpos.x = e.clientX * self.scaleIndex;
    self.mpos.y = e.clientY * self.scaleIndex;

    t = (new Date()).getTime();
    
    window.addEventListener("mousemove", scrollMouseMove);
    window.addEventListener("mouseup", scrollMouseUp);
  }
}

module.exports.prototype = new THREE.EventDispatcher();

module.exports.prototype.setPosition = function (x, y) {
  this.scrollPositon.x = -x;
  this.scrollPositon.y = y;
  TweenLite.to(this.context.spaceScene.camera.position, 0.5, {
    x: -this.scrollPositon.x, 
    y: this.scrollPositon.y,
    ease: Cubic.easeOut,
    onUpdate: function() {
  // figure out what brilliant to do here
    }
  });
}

module.exports.prototype.scrollToMousePosition = function(xPos, yPos){
  var self = this;

  var windowCenterY = $(window).scrollTop() + $(window).height() / 2;
  var windowCenterX = $(window).scrollLeft() + $(window).width() / 2;
  var factor = (this.context.spaceViewController.zoomer.zoom > 84000) ? 13 : 7;
  var dx = self.scrollPositon.x + (windowCenterX * self.scaleIndex - xPos * self.scaleIndex)/factor;
  var dy = self.scrollPositon.y + (windowCenterY * self.scaleIndex - yPos * self.scaleIndex)/factor;

  self.setScrollPosition(dx, dy);

  TweenLite.to(self.context.spaceScene.camera.position, 0.5, {
    x: -self.scrollPositon.x, 
    y: self.scrollPositon.y,
    ease: Cubic.easeOut,
    onUpdate: function() {
      self.dispatchEvent({
        type: "scroll", 
        objects: self.selectedPlanets
      });
    }
  });
  
}