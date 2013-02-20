module.exports = function(playerId, planets){
	Sprite.call(this);
	var _self = this;
	var len;

	this.playerId = playerId;
	this.planets = planets;

	this.selectionRectangle = new Rectangle();
	this.selectedPlanets = [];
	this.notSelectedPlanets = [];

	var planetOver;
	var state;

	var mouseDown = function() {
		_self.x = _self.parent.mouseX;
		_self.y = _self.parent.mouseY;

		_self.stage.addEventListener(MouseEvent.MOUSE_MOVE, mouseMove);
	  	_self.stage.addEventListener(MouseEvent.MOUSE_UP, mouseUp);
	  	window.addEventListener("mouseout",	mouseUp);

	  	_self.graphics.clear();

	  	len = _self.notSelectedPlanets.length;

		/*for(var i = 0;i < len;i ++) {
  			_self.notSelectedPlanets[i].removeEventListener(MouseEvent.MOUSE_OVER, planetOver);
  		}*/
	}

	var mouseMove = function(e) {
		_self.drawSelection();
	}

	var mouseUp = function(e) {
		var dx = _self.parent.mouseX - _self.x;
		var dy = _self.parent.mouseY - _self.y;

		if (dx < 0) {
			_self.selectionRectangle.x = _self.x + dx;
			_self.selectionRectangle.width = Math.abs(dx);
		} else {
			_self.selectionRectangle.x = _self.x;
			_self.selectionRectangle.width = dx;
		}

		if (dy < 0) {
			_self.selectionRectangle.y = _self.y + dy;
			_self.selectionRectangle.height = Math.abs(dy);
		} else {
			_self.selectionRectangle.y = _self.y;
			_self.selectionRectangle.height = dy;
		}


		_self.selectedPlanets = [];
		_self.notSelectedPlanets = [];

		len = _self.planets.length;


		var planetOut = function (e) {
			_self.state = null;
  			_self.graphics.clear();

  			e.currentTarget.removeEventListener(MouseEvent.MOUSE_OUT, planetOut);
  			e.currentTarget.removeEventListener(MouseEvent.CLICK, planetClick);
  		}

  		var planetClick = function (e) {
  			var ev = new Event("attack");
  			ev.planetToAttack = e.currentTarget;

  			_self.dispatchEvent(ev);
  		}

  		planetOver = function (e) {
  			_self.state = "preapreForAttack";

  			e.currentTarget.addEventListener(MouseEvent.MOUSE_OUT, planetOut);
  			e.currentTarget.addEventListener(MouseEvent.CLICK, planetClick);

  			_self.drawPaths(e.currentTarget);
  		}

		for(var i = 0;i < len;i ++) {
			if (_self.planets[i].getRect(_self.parent).intersects(_self.selectionRectangle) && _self.planets[i].data.Owner == _self.playerId) {
				_self.selectedPlanets.push(_self.planets[i]);
				_self.planets[i].select();
			} else {
				_self.notSelectedPlanets.push(_self.planets[i]);

				_self.planets[i].deselect();
	  			_self.planets[i].addEventListener(MouseEvent.MOUSE_OVER, planetOver);
			}
		}

		_self.stage.removeEventListener(MouseEvent.MOUSE_MOVE, mouseMove);
	  	_self.stage.removeEventListener(MouseEvent.MOUSE_UP, mouseUp);
	  	window.removeEventListener("mouseout",	mouseUp);

	  	_self.graphics.clear();
	  	_self.dispatchEvent(new Event("select"));

	  	/*if (_self.selectedPlanets.length > 0 && _self.notSelectedPlanets.length > 0) {
	  		len  = _self.notSelectedPlanets.length;

	  		

	  		for(var i = 0;i < len;i ++) {
	  			_self.notSelectedPlanets[i].addEventListener(MouseEvent.CLICK, planetClick);
	  			_self.notSelectedPlanets[i].addEventListener(MouseEvent.MOUSE_OVER, planetOver);
	  		}
	  	}*/
	}

	this.onMouseDown = function(e) {
		if (_self.state != "preapreForAttack")
			mouseDown(e);
	}
}

module.exports.prototype = new Sprite();
module.exports.prototype.activate = function() {
	if (!this.active) {
		this.active = true;
		this.stage.addEventListener(MouseEvent.MOUSE_DOWN, this.onMouseDown);
	}
}

module.exports.prototype.deactivate = function() {
	if (this.active) {
		this.active = false;
		this.stage.removeEventListener(MouseEvent.MOUSE_DOWN, this.onMouseDown);	
	}
}

module.exports.prototype.drawSelection = function() {
	this.graphics.clear();
	this.graphics.lineStyle(1, 0xFFFFFF);
	this.graphics.beginFill(0, 0.3);
	this.graphics.drawRect(0, 0, this.parent.mouseX - this.x, this.parent.mouseY - this.y);
	this.graphics.endFill();
}

module.exports.prototype.drawPaths = function(target) {
	var len = this.selectedPlanets.length;
	var r1 = target.getRect(this);
	var r2;

	this.graphics.clear();

	for(var i = 0;i < len;i ++) {
		r2 = this.selectedPlanets[i].getRect(this);

		this.graphics.lineStyle(4, 0xFFFFFF, 0.5);
		this.graphics.moveTo(r1.x + r1.width / 2, r1.y + r1.height / 2);
		this.graphics.lineTo(r2.x + r2.width / 2, r2.y + r2.height / 2);
	}
}