var Scroller = require("./scroller");
var Selection = require("./selection");
var Zoomer = require("./zoomer");
var Info = require("./info");

module.exports = function(context, config){
	THREE.EventDispatcher.call(this);

	var self = this;

  this.context = context;
  this.config = config;
  this.scrollPosition = new THREE.Vector3();

  this.zoomer = new Zoomer(context, config.zoomer, this);
  this.zoomer.addEventListener("scopeOfView", function(e) {
    self.scroller.scaleIndex = e.zoom;
    self.dispatchEvent(e);
    self.info.updatePosition();
  });
  this.zoomer.addEventListener("zoom", function(e) {
    self.scroller.scaleIndex = e.zoom;
    self.dispatchEvent(e);
    self.info.updatePosition();
  });

  this.scroller = new Scroller(context, config.scroller, this);
  this.scroller.addEventListener("scroll", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
  });
  this.scroller.addEventListener("scopeOfView", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
  });

  this.selection = new Selection(context, config.selection);
  this.selection.addEventListener("attackPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("supplyPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("selectPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("deselectPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("deselectAllPlanets", function(e) {
    self.dispatchEvent(e);
  });

  this.info = new Info(context);
  this.info.addEventListener("attackPlanet", function(e) {
    var attackSourcesIds = self.selection.getSelectedPlanetsIds()
    if (attackSourcesIds.length > 0)
      self.dispatchEvent({
        type: "attackPlanet", 
        attackSourcesIds: attackSourcesIds,
        planetToAttackId: e.id
      });
  });
  this.info.addEventListener("supplyPlanet", function(e) {
    var supplySourcesIds = self.selection.getSelectedPlanetsIds()
    if (supplySourcesIds.length > 0)
      self.dispatchEvent({
        type: "supplyPlanet", 
        supportSourcesIds: supplySourcesIds,
        planetToSupportId: e.id
      });
  });
  this.info.addEventListener("spyPlanet", function(e) {
    //spy logic 
  });

  // *****************************************************************

  this.onMouseDown = function(e) {
    if (self.context.renderer.domElement == e.target) {
      if (e.button != 0)
        self.scroller.scrollMouseDown(e);
      else
        self.selection.selectionMouseDown(e);
    }

    e.preventDefault();
    return false;
  }
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.activate = function() {
	if (!this.active) {
		this.active = true;
    this.scroller.scaleIndex = this.zoomer.getZoomIndex();
    this.zoomer.prepare();
		window.addEventListener("mousedown", this.onMouseDown);
	}
}

module.exports.prototype.deactivate = function() {
	if (this.active) {
		this.active = false;
		window.removeEventListener("mousedown", this.onMouseDown);
	}
}

module.exports.prototype.scrollTo = function (x, y, animated) {
  this.scroller.scrollTo(x, y, animated);
}

module.exports.prototype.getResolution = function() {
  var data = {
    width: Math.ceil(this.context.width*this.scroller.scaleIndex), 
    height: Math.ceil(this.context.height*this.scroller.scaleIndex) 
  }
  return data
}

module.exports.prototype.addScrollPosition = function(dx, dy, dz){
  return this.setScrollPosition(this.scrollPosition.x + dx, this.scrollPosition.y + dy, this.scrollPosition.z + dz)
}

module.exports.prototype.setScrollPosition = function(x, y, z){
  var xb = typeof x == "number" && !isNaN(x) && x != this.scrollPosition.x;
  var yb = typeof y == "number" && !isNaN(y) && y != this.scrollPosition.y;
  var zb = typeof z == "number" && !isNaN(z) && z != this.scrollPosition.z;

  if (!xb && !yb && !zb)
    return false;

  if (xb) {
    if (x < this.config.scroller.xMin)
      this.scrollPosition.x = this.config.scroller.xMin;
    else if (x > this.config.scroller.xMax)
      this.scrollPosition.x = this.config.scroller.xMax;
    else
      this.scrollPosition.x = x;  
  }
  
  if (yb) {
    if (y < this.config.scroller.yMin)
      this.scrollPosition.y = this.config.scroller.yMin;
    else if (y > this.config.scroller.yMax)
      this.scrollPosition.y = this.config.scroller.yMax;
    else
      this.scrollPosition.y = y;
  }

  if (zb) {
    if (this.config.zoomer.minZoom != null && this.config.zoomer.maxZoom != null) {
      if (z < this.config.zoomer.minZoom)
        this.scrollPosition.z = this.config.zoomer.minZoom;
      else if (z > this.config.zoomer.maxZoom)
        this.scrollPosition.z = this.config.zoomer.maxZoom;
      else
        this.scrollPosition.z = z;
    } else if (this.config.zoomer.minZoom != null && this.config.zoomer.maxZoom == null) {
      if (z < this.config.zoomer.minZoom)
        this.scrollPosition.z = this.config.zoomer.minZoom;
      else
        this.scrollPosition.z = z;
    } else if (this.config.zoomer.minZoom == null && this.config.zoomer.maxZoom != null) {
      if (z > this.config.zoomer.maxZoom)
        this.scrollPosition.z = this.config.zoomer.maxZoom;
      else
        this.scrollPosition.z = z;
    } else {
      this.scrollPosition.z = z;
    }
  }
  
  return true;
}