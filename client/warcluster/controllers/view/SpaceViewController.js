module.exports = function(){
	THREE.EventDispatcher.call(this);
	var _self = this;

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

  	var mouseUp = function(e) {
		  window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
  		window.removeEventListener("mouseout",	mouseUp);
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
       
  		_self.dispatchEvent({type: "scroll"});
  	}

  	var mouseDown = function(e) {
      e.preventDefault();
  		_self.mpos.x = e.clientX * _self.scaleIndex;
  		_self.mpos.y = e.clientY * _self.scaleIndex;

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