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

  var scrolled = false;
  
  this.attackTarget = null;
  this.supportTarget = null;

  this.selectedPlanets = [];
  this.selectedTooltipPlanet = null;
  this.ctrlKey = false;
  this.shiftKey = false;

  this.selectionRect = $('<div class="selection-rect"></div>');

  // *****************************************************************

  this.context.spaceScene.afterRenderFn = function() {
    for (var i=0;i < self.context.planetsHitObjects.length;i ++) {
      self.context.planetsHitObjects[i].on("mouseover", function(e) {
        self.onPlanetMouseOver(e);
      });
      self.context.planetsHitObjects[i].on("mouseout", function(e) {
        self.onPlanetMouseOut(e);
      });
    }
  }

  var keymap = {};
  $(document).keydown(function(e){
    if (keymap[e.keyCode])
      return ;
    keymap[e.keyCode] = true;
    
    switch (e.keyCode) {
      case 16:
        self.shiftKey = true;
        if (self.supportTarget)
          self.supportTarget.hideSupportSelection();
      break;
      case 17:
        self.ctrlKey = true;
        if (self.supportTarget)
          self.handleShowSupprotSelection();
      break;
    }
  });

  $(document).keyup(function(e){
    delete keymap[e.keyCode];
    switch (e.keyCode) {
      case 16:
        self.shiftKey = false;
        if (self.supportTarget)
          self.handleShowSupprotSelection();
      break;
      case 17:
        self.ctrlKey = false;
        if (self.supportTarget)
          self.supportTarget.hideSupportSelection();
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
        if (!self.shiftKey) {
          self.selectedTooltipPlanet = intersects[0].object.parent;
          self.dispatchEvent({
            type: "showPlanetInfo", 
            tooltipPlanet: self.selectedTooltipPlanet, 
            tooltipPosition: self.getTooltipPosition(),
            objects: self.selectedPlanets
          });
        } else { 
          var target = intersects[0].object.parent;

          if (self.shiftKey && target.data.Owner.indexOf(self.context.playerData.Username) != -1) {
            var index = self.selectedPlanets.indexOf(target);
            if (index == -1) {
              target.select();
              self.selectedPlanets.push(target);  
            } else {
              target.deselect();
              self.selectedPlanets.splice(index, 1);
            }
          } else if (!self.shiftKey) {
            console.log("ATTACK:", self.attackTarget, self.supportTarget)
            if (self.attackTarget) {
              self.dispatchEvent({
                type: "attackPlanet", 
                attackSourcesIds: self.getSelectedPlanetsIds(),
                planetToAttackId: self.getPlanetТоAttackId()
              });
            } else if (self.supportTarget) {
              self.dispatchEvent({
                type: "supportPlanet", 
                supportSourcesIds: self.getSelectedPlanetsIds(),
                planetToSupportId: self.getPlanetТоSupportId()
              });
            }
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

  var handleMouseActions = function(e) {

    var intersects = self.getMouseIntersectionObjects(e);
    
    if (intersects.length > 0) {
      var target = intersects[0].object.parent;
      console.log("1.handleMouseActions")
      if (target.data.Owner.indexOf(self.context.playerData.Username) != -1) {
        if (self.supportTarget && self.ctrlKey) {
          self.dispatchEvent({
            type: "supportPlanet", 
            supportSourcesIds: self.getSelectedPlanetsIds(),
            planetToSupportId: self.getPlanetТоSupportId()
          });
        } else if (self.shiftKey && !self.ctrlKey) {
          var index = self.selectedPlanets.indexOf(target);
          console.log("2.handleMouseActions", index)
          if (index == -1) {
            target.select();
            self.selectedPlanets.push(target);  
          } else {
            target.deselect();
            self.selectedPlanets.splice(index, 1);
          }
        } else {
          console.log("3.handleMouseActions")
          self.deselectAll();

          target.select();
          self.selectedPlanets.push(target);  
          
        }
      } else {
        if (self.selectedPlanets.length > 0) {
          if (self.attackTarget) {
            self.dispatchEvent({
              type: "attackPlanet", 
              attackSourcesIds: self.getSelectedPlanetsIds(),
              planetToAttackId: self.getPlanetТоAttackId()
            });
          }
        }
      }
    } else {
      for (var i = 0;i < self.selectedPlanets.length;i ++)
        self.selectedPlanets[i].deselect();
      self.selectedPlanets = [];
    }
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
      handleMouseActions(e);
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

  $(document).bind("contextmenu",function(e){
    if (!self.shiftKey)
      return false;
  });

  this.onMouseDown = function(e) {
    console.log(e.button )
    if (self.context.renderer.domElement == e.target) {
      if (e.button != 0)
        scrollMouseDown(e);
      else
        selectionMouseDown(e);
    }

    e.preventDefault();
    return false;
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
  worldPosition.x += this.selectedTooltipPlanet.data.width/2;
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
      if (target.rectHitTest(rect)) {
        target.select();
        if (this.selectedPlanets.indexOf(target) == -1)
          this.selectedPlanets.push(target);
      }
    }
  }

  if (this.selectedPlanets.length == 0)
    this.onPlanetMouseOut();
}

module.exports.prototype.deselectAll = function() {
  for (var i=0;i < this.selectedPlanets.length;i ++)
    this.selectedPlanets[i].deselect();
  this.selectedPlanets = [];
}

module.exports.prototype.onPlanetMouseOver = function(e) {
  if (this.selectedPlanets.length > 0) {
    if (e.target.parent.data.Owner.indexOf(this.context.playerData.Username) == -1) {
      this.attackTarget = e.target.parent;
      this.attackTarget.showAttackSelection();
    } else {
      this.supportTarget = e.target.parent;
      if (this.ctrlKey) {
        this.handleShowSupprotSelection();
      }
    }  
  }
}

module.exports.prototype.onPlanetMouseOut = function(e) {
  if (this.attackTarget) {
    this.attackTarget.hideAttackSelection();
    this.attackTarget = null;
  } else if (this.supportTarget) {
    this.supportTarget.hideSupportSelection();
    this.supportTarget = null;
  }
}

module.exports.prototype.handleShowSupprotSelection = function() {
  if (this.selectedPlanets.length == 1) {
    if (this.supportTarget.data.id != this.selectedPlanets[0].data.id) {
      this.supportTarget.showSupportSelection();  
    }
  } else {
    this.supportTarget.showSupportSelection();
  }
}

module.exports.prototype.getSelectedPlanetsIds = function() {
  var ids = [];
  for (var i = 0;i < this.selectedPlanets.length;i ++) 
    if (!this.supportTarget || this.supportTarget.data.id != this.selectedPlanets[i].data.id)
      ids.push(this.selectedPlanets[i].data.id);
  return ids;
}

module.exports.prototype.getPlanetТоAttackId = function() {
  return this.attackTarget.data.id;
}

module.exports.prototype.getPlanetТоSupportId = function() {
  return this.supportTarget.data.id;
}