var UserPopover = require("../../popovers/UserPopover");

module.exports = function(context){
	THREE.EventDispatcher.call(this);
	var self = this;

  this.context = context;
	this.active = false;
	this.mpos = {x: 0, y: 0};
	this.scrollPositon = {x: 0, y: 0};
  this.zoom = 0;
  this.zoomStep = 250;
  this.minZoom = null;
  this.maxZoom = null;
  this.xMin = -5000000;
  this.xMax = 5000000;
  this.yMin = -4000000;
  this.yMax = 4000000;
  this.scaleIndex = 1;

  var t;
  var scrolled = false;
  this.mouse = {
    x: 0,
    y: 0
  }
  this.selectedPlanet = null;
  var popover = new UserPopover();
  
  var getPopoverPosition = function() {
    if (!self.selectedPlanet)
      return null;
    var worldPosition = new THREE.Vector3();
    worldPosition.getPositionFromMatrix(self.selectedPlanet.matrixWorld);
    worldPosition.x += self.selectedPlanet.planetSize.width/2;
    var screenCoordinates = self.toScreenXY(worldPosition, self.context.camera, $(".content"));
    return screenCoordinates;
  }

  window.addEventListener('mousemove', function(e) {
    self.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    self.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
  }, false);

	var mouseUp = function(e) {
	  window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
		window.removeEventListener("mouseout",	mouseUp);

    if (!scrolled && (new Date()).getTime() - t < 200) {
      var intersects = self.getIntersectionObjects();
      if (intersects.length > 0) {
        self.selectedPlanet = intersects[0].object.parent;

        var position = getPopoverPosition();
        var event = {
          type: "selectPlanet", 
          target: self.selectedPlanet, 
          position: position
        };

        self.dispatchEvent(event);
      }
    }

    scrolled = false;
	}

	var mouseMove = function(e) {
		var dx = self.scrollPositon.x + (e.clientX * self.scaleIndex - self.mpos.x);
		var dy = self.scrollPositon.y + (e.clientY * self.scaleIndex - self.mpos.y);

		if (dx < self.xMin)
			self.scrollPositon.x = self.xMin;
		else
		if (dx > self.xMax)
			self.scrollPositon.x = self.xMax;
		else
			self.scrollPositon.x = dx;
  		

		if (dy < self.yMin)
			self.scrollPositon.y = self.yMin;
		else
  	if (dy > self.yMax)
			self.scrollPositon.y = self.yMax;
		else
			self.scrollPositon.y = dy;

		self.mpos.x = e.clientX * self.scaleIndex;
		self.mpos.y = e.clientY * self.scaleIndex;
     
    scrolled = true;

    TweenLite.to(self.context.spaceScene.camera.position, 0.7, {
      x: -self.scrollPositon.x, 
      y: self.scrollPositon.y,
      ease: Cubic.easeOut,
      onUpdate: function() {
        var position = getPopoverPosition();
        var event = {
          type: "scrollProgress", 
          target: self.selectedPlanet, 
          position: position
        };

        self.dispatchEvent(event);
      }
    });

		self.dispatchEvent({type: "scroll"});
	}
  
	var mouseDown = function(e) {
    e.preventDefault();
		self.mpos.x = e.clientX * self.scaleIndex;
		self.mpos.y = e.clientY * self.scaleIndex;

    t = (new Date()).getTime();
    
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
	}

	this.onMouseDown = function(e) {
		mouseDown(e);
	}

  window.addEventListener('mousewheel', function(e) {
    if (!self.active)
      return ;

    e.preventDefault();

    var st = e.wheelDelta > 0 ? -self.zoomStep : self.zoomStep;

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
        var position = getPopoverPosition();
        var event = {
          type: "zoomProgress", 
          target: self.selectedPlanet, 
          position: position
        };

        self.dispatchEvent(event);
      }
    });

    self.scaleIndex = self.zoom / 6000;
    self.dispatchEvent({type: "zoom", wheelDelta: st});
  });
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.activate = function() {
	if (!this.active) {
		this.active = true;
		window.addEventListener("mousedown", this.onMouseDown);
	}
}

module.exports.prototype.deactivate = function() {
	if (this.active) {
		this.active = false;
		window.removeEventListener("mousedown", this.onMouseDown);
	}
}

module.exports.prototype.getIntersectionObjects = function() {
  var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 0.5 );
  this.context.projector.unprojectVector( vector, this.context.camera );

  var raycaster = new THREE.Raycaster(this.context.camera.position, vector.sub(this.context.camera.position ).normalize());
  return raycaster.intersectObjects(this.context.hitObjects);
}

module.exports.prototype.toScreenXY = function ( position, camera, jqdiv ) {
    var pos = position.clone();
    projScreenMat = new THREE.Matrix4();
    projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
    //projScreenMat.multiplyVector3( pos );
    pos.applyProjection( projScreenMat )

    return { x: ( pos.x + 1 ) * jqdiv.width() / 2 + jqdiv.offset().left,
         y: ( - pos.y + 1) * jqdiv.height() / 2 + jqdiv.offset().top };
}

module.exports.prototype.setPosition = function (x, y) {
  this.scrollPositon.x = -x;
  this.scrollPositon.y = y;

  this.context.spaceScene.moveTo(x, y);
}