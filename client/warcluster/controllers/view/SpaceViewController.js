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

  this.gridWidth = 5000;
  this.gridHeight = 5000;

  this.cell = {xIndex: null, yIndex: null};
  this.tlPosition = {xIndex: null, yIndex: null};
  this.brPosition = {xIndex: null, yIndex: null};
  this.screenRect = {
    width: 0,
    height: 0,
    cx: 0,
    cy: 0,
   X: 0,
   Y: 0
  }

  this.resolution = { width: 0, height: 0 }

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
    self.checkPosition();
  });

  this.scroller = new Scroller(context, config.scroller, this);
  this.scroller.addEventListener("scroll", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
    self.checkPosition();
  });
  this.scroller.addEventListener("scopeOfView", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
  });

  this.selection = new Selection(context, config.selection);
  this.selection.addEventListener("attackPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("spyPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("supplyPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("selectionChanged", function(e) {
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
    else {
      var n = noty({
              text: "First you must select a planet you control in order to Attack",
              type: 'information'
          }); 
    }
  });
  this.info.addEventListener("supplyPlanet", function(e) {
    var supplySourcesIds = self.selection.getSelectedPlanetsIds()
    if (supplySourcesIds.length > 0)
      self.dispatchEvent({
        type: "supplyPlanet", 
        supportSourcesIds: supplySourcesIds,
        planetToSupportId: e.id
      });
    else {
      var n = noty({
              text: "First you must select a planet you control in order to Supply",
              type: 'information'
          }); 
    }
  });
  this.info.addEventListener("spyPlanet", function(e) {
    var spySourcesIds = self.selection.getSelectedPlanetsIds()
    if (spySourcesIds.length > 0)
      self.dispatchEvent({
        type: "spyPlanet", 
        spySourcesIds: spySourcesIds,
        planetToSpyId: e.id
      });
    else {
      var n = noty({
              text: "First you must select a planet you control in order to Spy",
              type: 'information'
          });  
    }
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
    
    this.zoomer.prepare();
    this.scroller.scaleIndex = this.zoomer.getZoomIndex();
    
    this.updateResolution();

    this.tlPosition = this.getGridPosition(this.context.spaceScene.camera.position.x - (this.resolution.width / 2), this.context.spaceScene.camera.position.y + (this.resolution.height / 2));
    this.brPosition = this.getGridPosition(this.context.spaceScene.camera.position.x + (this.resolution.width / 2), this.context.spaceScene.camera.position.y - (this.resolution.height / 2));

    this.updateScreenRect();

		window.addEventListener("mousedown", this.onMouseDown);
	}
}

module.exports.prototype.deactivate = function() {
	if (this.active) {
		this.active = false;
		window.removeEventListener("mousedown", this.onMouseDown);
	}
}

module.exports.prototype.checkPosition = function() {
  this.updateResolution();

  var tlPosition = this.getGridPosition(this.context.spaceScene.camera.position.x - (this.resolution.width / 2), this.context.spaceScene.camera.position.y + (this.resolution.height / 2));
  var brPosition = this.getGridPosition(this.context.spaceScene.camera.position.x + (this.resolution.width / 2), this.context.spaceScene.camera.position.y - (this.resolution.height / 2));

  if (this.tlPosition.xIndex != tlPosition.xIndex || this.tlPosition.yIndex != tlPosition.yIndex || 
      this.brPosition.xIndex != brPosition.xIndex || this.brPosition.yIndex != brPosition.yIndex) {

    this.tlPosition = tlPosition;
    this.brPosition = brPosition;
    
    this.updateScreenRect();

    //console.log("1.########## checkPosition:", this.tlPosition, this.brPosition, this.screenRect)

    var position = {
     X: Math.ceil(this.context.spaceScene.camera.position.x),
     Y: Math.ceil(this.context.spaceScene.camera.position.y)
    };

    this.context.commandsManager.scopeOfView(position, this.resolution);
  }
}

module.exports.prototype.scrollTo = function (x, y, animated) {
  this.scroller.scrollTo(x, y, animated);
}

module.exports.prototype.updateResolution = function() {
  this.resolution.width = Math.ceil(this.context.width*this.scroller.scaleIndex);
  this.resolution.height = Math.ceil(this.context.height*this.scroller.scaleIndex);
}

module.exports.prototype.updateScreenRect = function() {
  var tl = this.getCellPosition(this.tlPosition.xIndex, this.tlPosition.yIndex);
  var br = this.getCellPosition(this.brPosition.xIndex, this.brPosition.yIndex, "br");

  var width = Math.abs(br.x - tl.x);
  var height = Math.abs(tl.y - br.y);

  this.screenRect.width = width;
  this.screenRect.height = height;
  this.screenRect.cx = tl.x + (width / 2);
  this.screenRect.cy = tl.y - (height / 2);
  this.screenRect.x = tl.x;
  this.screenRect.y = tl.y;

  //console.log("### updateScreenRect", this.screenRect)

  return this.screenRect;
}

module.exports.prototype.getCellPosition = function(xIndex, yIndex, position) {
  switch (position) {
    case "tr":
      return {
       X: xIndex > 0 ? Math.ceil(xIndex * this.gridWidth) : Math.floor((xIndex + 1) * this.gridWidth),
       Y: yIndex > 0 ? Math.ceil(yIndex * this.gridHeight) : Math.floor((yIndex + 1) * this.gridHeight)
      };
    break;
    case "bl":
      return {
       X: xIndex > 0 ? Math.ceil((xIndex - 1) * this.gridWidth) : Math.floor(xIndex * this.gridWidth),
       Y: yIndex > 0 ? Math.ceil((yIndex - 1) * this.gridHeight) : Math.floor(yIndex * this.gridHeight)
      };
    break;
    case "br":
      return {
       X: xIndex > 0 ? Math.ceil(xIndex * this.gridWidth) : Math.floor((xIndex + 1) * this.gridWidth),
       Y: yIndex > 0 ? Math.ceil((yIndex - 1) * this.gridHeight) : Math.floor(yIndex * this.gridHeight)
      };
    break;
  }

  return {
   X: xIndex > 0 ? Math.ceil((xIndex - 1) * this.gridWidth) : Math.floor(xIndex * this.gridWidth),
   Y: yIndex > 0 ? Math.ceil(yIndex * this.gridHeight) : Math.floor((yIndex + 1) * this.gridHeight)
  };
}



module.exports.prototype.getGridPosition = function(x, y) {
  return {
    xIndex: this.roundCoordinate(x, this.gridWidth),
    yIndex: this.roundCoordinate(y, this.gridHeight)
  }
}

module.exports.prototype.roundCoordinate = function(d, w) {
  if (d > 0)
    return parseInt(d / w) + 1;
  else if (d < 0)
    return Math.floor(d / w);

  return 1;
}

module.exports.prototype.translateIndex = function(i, d) {
  if (i > 0 && i + d < 1)
    return i + d - 1;
  else if (i < 0 && i + d > -1)
    return i + d + 1;
  return i + d;
}

/*module.exports.prototype.getRect = function(xIndex1, yIndex1, xIndex2, yIndex2){
  var tl = this.getCellPosition(xIndex1, yIndex1);
  var br = this.getCellPosition(xIndex2, yIndex2, "br");
  //console.log("######## getRect:", tl, br)
  return {
    width: Math.abs(br.x - tl.x),
    height: Math.abs(tl.y - br.y),
    cx: tl.x + Math.abs(br.x - tl.x) / 2,
    cy: tl.y - Math.abs(tl.y - br.y) / 2,
   X: tl.x,
   Y: tl.y
  }
}*/

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

module.exports.prototype.pressCtrlKey = function(){
  this.selection.pressCtrlKey();
}

module.exports.prototype.releaseCtrlKey = function(){
  this.selection.releaseCtrlKey();
}

module.exports.prototype.pressShiftKey = function(){
  this.selection.pressShiftKey();
  this.zoomer.shiftKey = true;
}

module.exports.prototype.releaseShiftKey = function(){
  this.selection.releaseShiftKey();
  this.zoomer.shiftKey = false;
}

