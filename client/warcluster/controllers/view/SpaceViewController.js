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
  
  this.attackTarget = null;
  this.selectedPlanets = [];
  this.selectedTooltipPlanet = null;
  this.ctrlKey = false;
  this.shiftKey = false;

  this.selectionRect = $('<div class="selection-rect"></div>');

  // *****************************************************************

  this.context.spaceScene.afterUpdateFn = function() {
    for (var i=0;i < self.context.planetsHitObjects.length;i ++) {
      self.context.planetsHitObjects[i].on("mouseover", function(e) {
        self.onPlanetMouseOver(e);
      });
      self.context.planetsHitObjects[i].on("mouseout", function(e) {
        self.onPlanetMouseOut(e);
      });
    }
  }

  $(document).keydown(function(e){
    //console.log(e.keyCode);
    switch (e.keyCode) {
      case 17:
        self.ctrlKey = true;
        if (self.attackTarget)
          self.attackTarget.selectForAttack();
      break;
      case 16:
        self.shiftKey = true;
      break;
    }
  });

  $(document).keyup(function(e){
    switch (e.keyCode) {
      case 17:
        self.ctrlKey = false;
        if (self.attackTarget)
          self.attackTarget.deselectFromAttack();
      break;
      case 16:
        self.shiftKey = false;
      break;
    }
  });

  // *****************************************************************

	var scrollMouseUp = function(e) {
	  window.removeEventListener("mousemove", scrollMouseMove);
    window.removeEventListener("mouseup", scrollMouseUp);
		window.removeEventListener("mouseout",	scrollMouseUp);

    if (!scrolled) {
      var intersects = self.getMouseIntersectionObjects(e);
      if (intersects.length > 0) {
        if (!self.ctrlKey && !self.shiftKey) {
          self.selectedTooltipPlanet = intersects[0].object.parent;
          self.dispatchEvent({
            type: "selectPlanet", 
            tooltipPlanet: self.selectedTooltipPlanet, 
            tooltipPosition: self.getTooltipPosition(),
            objects: self.selectedPlanets
          });
        } else {
          var target = intersects[0].object.parent;
          var index = self.selectedPlanets.indexOf(target);
          if (index == -1) {
            if (target.data.Owner.indexOf(self.context.playerData.Username) != -1) {
              target.select();
              self.selectedPlanets.push(target);  
            } else {
              self.dispatchEvent({
                type: "attackPlanet", 
                attackSourcesIds: self.getSelectedPlanetsIds(),
                planetToAttackId: self.getPlanetТоAttackId()
              });
            }
          } else {
            target.deselect();
            self.selectedPlanets.splice(index, 1);
          }
        }
      } else {
        for (var i = 0;i < self.selectedPlanets.length;i ++)
          self.selectedPlanets[i].deselect();
        self.selectedPlanets = [];
      }
    }

    scrolled = false;
	}

	var scrollMouseMove = function(e) {
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
        self.dispatchEvent({
          type: "scrollProgress", 
          tooltipPlanet: self.selectedTooltipPlanet, 
          tooltipPosition: self.getTooltipPosition(),
          objects: self.selectedPlanets
        });
      }
    });

		self.dispatchEvent({type: "scroll"});
	}
  
	var scrollMouseDown = function(e) {
    e.preventDefault();
		self.mpos.x = e.clientX * self.scaleIndex;
		self.mpos.y = e.clientY * self.scaleIndex;

    t = (new Date()).getTime();
    
    window.addEventListener("mousemove", scrollMouseMove);
    window.addEventListener("mouseup", scrollMouseUp);
	}

  // *****************************************************************

  var selectionMouseMove = function(e) {
    e.preventDefault();

    var w = e.clientX - self.mpos.x;
    var h = e.clientY - self.mpos.y;

    var css = {
      left: w >= 0 ? self.mpos.x : e.clientX,
      top: h >= 0 ? self.mpos.y : e.clientY,
      width: w >= 0 ? w : Math.abs(w),
      height: h >= 0 ? h : Math.abs(h)
    };

    $(self.selectionRect).css(css);
  }

  

  var selectionMouseUp = function(e) {
    e.preventDefault();

    var w = e.clientX - self.mpos.x;
    var h = e.clientY - self.mpos.y;
    var rect = {
      x: w >= 0 ? self.mpos.x : e.clientX,
      y: h >= 0 ? self.mpos.y : e.clientY,
      width: w >= 0 ? w : Math.abs(w),
      height: h >= 0 ? h : Math.abs(h)
    };

    if (rect.width > 0 || rect.height > 0)
      self.hitTestPlanets(rect);
    else
      scrollMouseUp(e);
    self.selectionRect.remove();

    window.removeEventListener("mousemove", selectionMouseMove);
    window.removeEventListener("mouseup", selectionMouseUp);
  }

  var selectionMouseDown = function(e) {
    e.preventDefault();

    self.mpos.x = e.clientX;
    self.mpos.y = e.clientY;

    $("body").append(self.selectionRect);

    var css = {
      left: self.mpos.x,
      top: self.mpos.y,
      width: e.clientX - self.mpos.x,
      height: e.clientY - self.mpos.y
    }

    $(self.selectionRect).css(css);

    window.addEventListener("mousemove", selectionMouseMove);
    window.addEventListener("mouseup", selectionMouseUp);
  }

  // *****************************************************************

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
        self.dispatchEvent({
          type: "zoomProgress", 
          tooltipPlanet: self.selectedTooltipPlanet, 
          tooltipPosition: self.getTooltipPosition(),
          objects: self.selectedPlanets
        });
      }
    });

    self.scaleIndex = self.zoom / 6000;
    self.dispatchEvent({type: "zoom", wheelDelta: st});
  });

  // *****************************************************************

  this.onMouseDown = function(e) {
    if (!self.ctrlKey)
      scrollMouseDown(e);
    else
      selectionMouseDown(e);
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

module.exports.prototype.getMouseIntersectionObjects = function(e) {
  var mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  var mouseY = - (e.clientY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
  this.context.projector.unprojectVector( vector, this.context.camera );

  var raycaster = new THREE.Raycaster(this.context.camera.position, vector.sub(this.context.camera.position ).normalize());
  return raycaster.intersectObjects(this.context.planetsHitObjects);
}

module.exports.prototype.toScreenXY = function ( position, camera, $container ) {
  var pos = position.clone();
  projScreenMat = new THREE.Matrix4();
  projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
  //projScreenMat.multiplyVector3( pos );
  pos.applyProjection( projScreenMat )

  return { 
    x: ( pos.x + 1 ) * $container.width() / 2 + $container.offset().left,
    y: ( - pos.y + 1) * $container.height() / 2 + $container.offset().top 
  };
}

module.exports.prototype.setPosition = function (x, y) {
  this.scrollPositon.x = -x;
  this.scrollPositon.y = y;

  this.context.spaceScene.moveTo(x, y);
}

module.exports.prototype.getTooltipPosition = function() {
  if (!this.selectedTooltipPlanet)
    return null;
  var worldPosition = new THREE.Vector3();
  worldPosition.getPositionFromMatrix(this.selectedTooltipPlanet.matrixWorld);
  worldPosition.x += this.selectedTooltipPlanet.planetSize.width/2;
  return this.toScreenXY(worldPosition, this.context.camera, this.context.$content);
}

module.exports.prototype.hitTestPlanets = function(rect) {
  if (!this.shiftKey)
    this.selectedPlanets = [];
  for (var i=0;i < this.context.planetsHitObjects.length;i ++) {
    var target = this.context.planetsHitObjects[i].parent;
    if (target.data.Owner.indexOf(this.context.playerData.Username) != -1) {
      if (!this.shiftKey)
        target.deselect();
      if (target.rectHitTest(rect))
        target.select();
      if (this.selectedPlanets.indexOf(target) == -1)
        this.selectedPlanets.push(target);
    }
  }
}

module.exports.prototype.onPlanetMouseOver = function(e) {
  if (e.target.parent.data.Owner.indexOf(this.context.playerData.Username) == -1 &&
      this.selectedPlanets.length > 0) {
    if (this.ctrlKey)
      e.target.parent.selectForAttack();
    this.attackTarget = e.target.parent;
  }
}

module.exports.prototype.onPlanetMouseOut = function(e) {
  if (this.selectedPlanets.length > 0) {
    this.attackTarget = null;
    e.target.parent.deselectFromAttack();
  }
}

module.exports.prototype.getSelectedPlanetsIds = function() {
  var ids = [];
  for (var i = 0;i < this.selectedPlanets.length;i ++) 
    ids.push(this.selectedPlanets[i].data.id);

  console.log("getSelectedPlanetsIds:", ids)
  return ids;
}

module.exports.prototype.getPlanetТоAttackId = function() {
  return this.attackTarget.data.id;
}