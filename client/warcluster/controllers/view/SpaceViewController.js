module.exports = function(context){
	THREE.EventDispatcher.call(this);
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

  var t;
  var scrolled = false;
  this.mouse = {
    x: 0,
    y: 0
  }

  window.addEventListener('mousemove', function(e) {
    _self.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    _self.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
  }, false);

	var mouseUp = function(e) {
	  window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
		window.removeEventListener("mouseout",	mouseUp);

    console.log("1.intersects:", scrolled, (new Date()).getTime() - t);

    if (!scrolled && (new Date()).getTime() - t < 200) {
      var intersects = _self.getIntersectionObjects();
      if (intersects.length > 0) {
        var event = {
          type: "selectPlanet", 
          target: intersects[0], 
          screenCoordinates: _self.getScreenCoordinates(intersects[0].object)
        };
        _self.dispatchEvent(event);
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
    console.log("mousewheel", e.wheelDelta, _self.zoom);

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

module.exports.prototype.getScreenCoordinates = function(object) {
  var scp = object.matrixWorld.getPosition().clone();
  var screenPos = object.matrixWorld.getPosition().clone();
  this.context.projector.projectVector( screenPos, this.context.camera );
  screenPos.x = ( screenPos.x + 1 ) * (window.innerWidth / 2);
  screenPos.y = ( - screenPos.y + 1) * (window.innerHeight / 2);

  /*var _viewProjectionMatrix = new THREE.Matrix4()
  _viewProjectionMatrix.multiply( _self.context.camera.projectionMatrix, _self.context.camera.matrixWorldInverse );

  var _frustum = new THREE.Frustum();
  _frustum.setFromMatrix( _viewProjectionMatrix );

  var modelMatrix = object.matrixWorld;
  var _vertex = new THREE.RenderableVertex();
  _vertex.positionWorld.copy( scp );

  modelMatrix.multiplyVector3( _vertex.positionWorld );

  _vertex.positionScreen.copy( _vertex.positionWorld );
  _viewProjectionMatrix.multiplyVector4( _vertex.positionScreen );

  _vertex.positionScreen.x /= _vertex.positionScreen.w;
  _vertex.positionScreen.y /= _vertex.positionScreen.w;

  _vertex.visible = _vertex.positionScreen.z > _self.context.camera.near && _vertex.positionScreen.z < _self.context.camera.far;


  console.log(_vertex);*/


  return screenPos;
}