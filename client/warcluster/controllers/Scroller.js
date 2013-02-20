module.exports = function(){
	THREE.EventDispatcher.call(this);
	var _self = this;

  	this.active = false;
  	this.mpos = {x: 0, y: 0};
  	this.scrollPosiiton = {x: 0, y: 0};

  	var mouseUp = function(e) {
		  window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
  		window.removeEventListener("mouseout",	mouseUp);
  	}

  	var mouseMove = function(e) {

  		var dx = _self.scrollPosiiton.x + (e.clientX - _self.mpos.x) * 1;
  		var dy = _self.scrollPosiiton.y + (e.clientY - _self.mpos.y) * 1;

  		/*if (dx < -500)
  			_self.scrollPosiiton.x = -500;
  		else
  		if (dx > 500)
  			_self.scrollPosiiton.x = 500;
  		else*/
  			_self.scrollPosiiton.x = dx;
	  		

  		/*if (dy < -400)
  			_self.scrollPosiiton.y = -400;
  		else
	  	if (dy > 400)
  			_self.scrollPosiiton.y = 400;
  		else*/
  			_self.scrollPosiiton.y = dy;

  		_self.mpos.x = e.clientX;
  		_self.mpos.y = e.clientY;

  		_self.dispatchEvent(new Event("scroll"));
  	}

  	var mouseDown = function(e) {
  		_self.mpos.x = e.clientX;
  		_self.mpos.y = e.clientY;

      window.addEventListener("mousemove", mouseMove);
      window.addEventListener("mouseup", mouseUp);
  	}

  	this.onMouseDown = function(e) {
  		mouseDown(e);
  	}
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