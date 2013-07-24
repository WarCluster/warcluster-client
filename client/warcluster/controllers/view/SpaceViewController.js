var UserPopover = require("../../popovers/UserPopover");

module.exports = function(context){
	THREE.EventDispatcher.call(this);
  var t;
	var _self = this;
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

  var scrolled = false;
  this.mouse = {
    x: 0,
    y: 0
  }
  this.selectedPlanet = null;
  var popover = new UserPopover();
  
  var getPopoverPosition = function() {
    var worldPosition = new THREE.Vector3();
    worldPosition.getPositionFromMatrix(_self.selectedPlanet.matrixWorld);
    worldPosition.x += _self.selectedPlanet.planetSize.width/2;
    var screenCoordinates = _self.toScreenXY(worldPosition, _self.context.camera, $(".content"));
    return screenCoordinates;
  }

  window.addEventListener('mousemove', function(e) {
    _self.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    _self.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
  }, false);

	var mouseUp = function(e) {
	  window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
		window.removeEventListener("mouseout",	mouseUp);

    if (!scrolled && (new Date()).getTime() - t < 200) {
      var intersects = _self.getIntersectionObjects();
      if (intersects.length > 0) {
        _self.selectedPlanet = intersects[0].object.parent;
        console.log("_self.selectedPlanet.data.Owner: " + _self.selectedPlanet);
        if(_self.selectedPlanet.data.Owner !== ""){
          var position = getPopoverPosition();
          var event = {
            type: "selectPlanet", 
            target: _self.selectedPlanet, 
            screenCoordinates: position
          };
          popover.render(_self.selectedPlanet.data);
          popover.move(position.x, position.y);
          _self.dispatchEvent(event);   
        }
      }
    }

    scrolled = false;
	}

	var mouseMove = function(e) {
		var dx = _self.scrollPositon.x + (e.clientX * _self.scaleIndex - _self.mpos.x);
		var dy = _self.scrollPositon.y + (e.clientY * _self.scaleIndex - _self.mpos.y);

		if (dx < _self.xMin)
			_self.scrollPositon.x = _self.xMin;
		else
		if (dx > _self.xMax)
			_self.scrollPositon.x = _self.xMax;
		else
			_self.scrollPositon.x = dx;
  		

		if (dy < _self.yMin)
			_self.scrollPositon.y = _self.yMin;
		else
  	if (dy > _self.yMax)
			_self.scrollPositon.y = _self.yMax;
		else
			_self.scrollPositon.y = dy;

		_self.mpos.x = e.clientX * _self.scaleIndex;
		_self.mpos.y = e.clientY * _self.scaleIndex;
     
    scrolled = true;

    TweenLite.to(_self.context.spaceScene.camera.position, 0.7, {
      x: -_self.context.spaceViewController.scrollPositon.x, 
      y: _self.context.spaceViewController.scrollPositon.y,
      ease: Cubic.easeOut,
      onUpdate: function() {
        if (_self.selectedPlanet) {
          var position = getPopoverPosition();
          popover.move(position.x, position.y);  
        }
      }
    });

		_self.dispatchEvent({type: "scroll"});
	}
  
	var mouseDown = function(e) {
    e.preventDefault();
		_self.mpos.x = e.clientX * _self.scaleIndex;
		_self.mpos.y = e.clientY * _self.scaleIndex;

    t = (new Date()).getTime();
    
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
	}

	this.onMouseDown = function(e) {
		mouseDown(e);
	}

  window.addEventListener('mousewheel', function(e) {
    if (!_self.active)
      return ;

    e.preventDefault();

    var st = e.wheelDelta > 0 ? -_self.zoomStep : _self.zoomStep;

    if (_self.minZoom != null && _self.maxZoom != null) {
      if (_self.zoom + st < _self.minZoom)
        _self.zoom = _self.minZoom;
      else if (_self.zoom + st > _self.maxZoom)
        _self.zoom = _self.maxZoom;
      else
        _self.zoom += st;
    } else if (_self.minZoom != null && _self.maxZoom == null) {
      if (_self.zoom + st < _self.minZoom)
        _self.zoom = _self.minZoom;
      else
        _self.zoom += st;
    } else if (_self.minZoom == null && _self.maxZoom != null) {
      if (_self.zoom + st > _self.maxZoom)
        _self.zoom = _self.maxZoom;
      else
        _self.zoom += st;
    } else {
      _self.zoom += st;
    }

    TweenLite.to(_self.context.spaceScene.camera.position, 0.7, {
      z: _self.context.spaceViewController.zoom,
      ease: Cubic.easeOut,
      onUpdate: function() {
        if (_self.selectedPlanet) {
          var position = getPopoverPosition();
          popover.move(position.x, position.y);  
        }
      }
    });

    _self.scaleIndex = _self.zoom / 6000;
    _self.dispatchEvent({type: "zoom", wheelDelta: st});
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