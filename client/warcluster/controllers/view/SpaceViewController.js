var Scroller = require("./scroller");
var Selection = require("./selection");
var Zoomer = require("./zoomer");
var Info = require("./info");

var Rect = require("x-math").Rect;

module.exports = function(context, config){
	THREE.EventDispatcher.call(this);

	var self = this;

  this.gridWidth = 1000;
  this.gridHeight = 1000;

  /*console.log("1.#####.diff:", this.getGridPosition(0, 0), this.getGridPosition(0, -1000), this.getGridPosition(-1000, -1000), this.getGridPosition(-1000, 0))

  console.log("1.#####.diff:", this.getGridPosition(1000, 1000), this.getGridPosition(1000, -1000), this.getGridPosition(-1000, -1000), this.getGridPosition(-1000, 1000))
  console.log("1.#####.diff:", this.getGridPosition(0, 0), this.getGridPosition(1000, 0), this.getGridPosition(1000, 1000), this.getGridPosition(0, 1000))
  console.log("1.#####.diff:", this.getGridPosition(0, 0), this.getGridPosition(-1000, 0), this.getGridPosition(-1000, -1000), this.getGridPosition(0, -1000))
  console.log("1.#####.diff:", this.getGridPosition(0, 0), this.getGridPosition(-1999.99, 0), this.getGridPosition(-1999.99, -1999.99), this.getGridPosition(0, -1999.99))*/
  //console.log("2.#####.diff:", Rect.difference(new Rect(0, 100, 100, 100), new Rect(0, 0, 100, 100))[0])

  //console.log("1.#####.diff:", Rect.difference(new Rect(0, -3000, 5000, 3000), new Rect(0, -2000, 5000, 3000))[0])
  //console.log("2.#####.diff:", Rect.difference(new Rect(0, -2000, 5000, 3000), new Rect(0, -3000, 5000, 3000))[0])
  
  //console.log("3.#####.diff:", Rect.difference(new Rect(0, 0, 100, 100), new Rect(0, 10, 100, 100)))
  //console.log("4.#####.diff:", Rect.difference(new Rect(0, 10, 100, 100), new Rect(0, 0, 100, 100)))

  this.context = context;
  this.config = config;
  this.scrollPosition = new THREE.Vector3();
  this.startPosition = new THREE.Vector3();

  this.xIndex;
  this.yIndex;

  

  this.zoomer = new Zoomer(context, config.zoomer, this);
  this.zoomer.addEventListener("scopeOfView", function(e) {
    self.scroller.scaleIndex = e.zoom;
    self.dispatchEvent(e);
    self.info.updatePosition();
    self.refreshScreen();
  });
  this.zoomer.addEventListener("zoom", function(e) {
    self.scroller.scaleIndex = e.zoom;
    self.dispatchEvent(e);
    self.info.updatePosition();
    self.refreshScreen();
  });

  this.scroller = new Scroller(context, config.scroller, this);
  this.scroller.addEventListener("scroll", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
    self.refreshScreen();
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
    var spySourcesIds = self.selection.getSelectedPlanetsIds()
    if (spySourcesIds.length > 0)
      self.dispatchEvent({
        type: "spyPlanet", 
        spySourcesIds: spySourcesIds,
        planetToSpyId: e.id
      });
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
module.exports.prototype.activate = function(x, y) {
	if (!this.active) {
		this.active = true;
    this.scroller.scaleIndex = this.zoomer.getZoomIndex();
    this.zoomer.prepare();
		window.addEventListener("mousedown", this.onMouseDown);

    this.startPosition.x = x;
    this.startPosition.y = y;

    this.scrollTo(x, y);

    var p = this.getGridPosition(this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y);
    console.log("#### ACTIVATE:", p.xIndex, p.yIndex)

    this.refreshScreen();
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
    return parseInt(d / w);

  return 1;
}

module.exports.prototype.getCellPosition = function(xIndex, yIndex, position) {
  switch (position) {
    case "tr":
      return {
        x: xIndex > 0 ? Math.ceil(xIndex * this.gridWidth) : Math.floor((xIndex + 1) * this.gridWidth),
        y: yIndex > 0 ? Math.ceil(yIndex * this.gridHeight) : Math.floor((yIndex + 1) * this.gridHeight)
      };
    break;
    case "bl":
      return {
        x: xIndex > 0 ? Math.ceil((xIndex - 1) * this.gridWidth) : Math.floor(xIndex * this.gridWidth),
        y: yIndex > 0 ? Math.ceil((yIndex - 1) * this.gridHeight) : Math.floor(yIndex * this.gridHeight)
      };
    break;
    case "br":
      return {
        x: xIndex > 0 ? Math.ceil(xIndex * this.gridWidth) : Math.floor((xIndex + 1) * this.gridWidth),
        y: yIndex > 0 ? Math.ceil((yIndex - 1) * this.gridHeight) : Math.floor(yIndex * this.gridHeight)
      };
    break;
  }

  return {
    x: xIndex > 0 ? Math.ceil((xIndex - 1) * this.gridWidth) : Math.floor(xIndex * this.gridWidth),
    y: yIndex > 0 ? Math.ceil(yIndex * this.gridHeight) : Math.floor((yIndex + 1) * this.gridHeight)
  };
}

module.exports.prototype.getScreenRectangle = function(sc) {
  var gPosition = this.getGridPosition(this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y);
  var resolution = this.getResolution();
  //console.log("1.getScreenRectangle:", sc, resolution.width, resolution.height)
  if (!isNaN(sc)) {
    resolution.width *= sc;
    resolution.height *= sc;  
  }
  //console.log("2.getScreenRectangle:", resolution.width, resolution.height)

  var iw = Math.ceil((resolution.width / 2) / this.gridWidth);
  var ih = Math.ceil((resolution.height / 2) / this.gridHeight);

  var width = (iw * 2 + 1) * this.gridWidth;
  var height = (ih * 2 + 1) * this.gridHeight;

  var tl = this.getCellPosition(this.translateIndex(gPosition.xIndex, - iw), this.translateIndex(gPosition.yIndex, ih));


  var data = {
    width: width,
    height: height,
    cx: tl.x + (width / 2),
    cy: tl.y - (height / 2),
    x: tl.x,
    y: tl.y
  }

  //console.log("1.getScreenRectangle", this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y, iw, ih, resolution, tl, Math.ceil(resolution.height / this.gridHeight))
  //console.log("2.getScreenRectangle", gPosition, data)

  return data;
}

module.exports.prototype.translateIndex = function(i, d) {
  if (i > 0 && i + d < 1)
    return i + d - 1;
  else if (i < 0 && i + d > -1)
    return i + d + 1;
  return i + d;
}

module.exports.prototype.scopeOfView = function(rect) {
  //console.log("scopeOfView", rect.left, rect.top, rect.left + rect.width / 2, rect.top - rect.height / 2, rect.width, rect.height)
  this.context.commandsManager.scopeOfView(rect.left + rect.width / 2, rect.top - rect.height / 2, rect.width, rect.height);
}

module.exports.prototype.refreshScreen = function() {
  var gPosition = this.getGridPosition(this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y);
  var sr = this.getScreenRectangle(1.1);

  var positionChanged = gPosition.xIndex != this.xIndex || gPosition.yIndex != this.yIndex;
  var sizeChanged = this.prevRect && (Math.abs(this.prevRect.width - sr.width) > 500 || Math.abs(this.prevRect.height - sr.height) > 500)

  if (positionChanged || sizeChanged) {

    console.log("------------------------ refreshScreen --------------------------")
    
    var rect = new Rect(sr.x, -sr.y, sr.width, sr.height);

    if (this.prevRect) {
      if (!Rect.equals(rect, this.prevRect)) {
        this.refreshByRectangles(rect, this.prevRect);
        this.prevRect = rect;
      }
    } else {
      this.refreshByRectangles(rect, new Rect(0, 0, 0, 0));
      this.prevRect = rect;
    }

    this.xIndex = gPosition.xIndex;
    this.yIndex = gPosition.yIndex;
  }
}

module.exports.prototype.refreshByRectangles = function(rect, prevRect){
  var rects1 = Rect.difference(rect, prevRect);
  var r = rect.clone()
  r.top = -r.top;

  this.context.spaceScene.gc(r);
  
  for (i = 0;i < rects1.length;i ++) {
    //rects1[i].top = -rects1[i].top;
    this.context.commandsManager.scopeOfView(rects1[i].left + rects1[i].width / 2, -rects1[i].top - rects1[i].height / 2, rects1[i].width, rects1[i].height);
  }
}

module.exports.prototype.getRect = function(xIndex1, yIndex1, xIndex2, yIndex2){
  var tl = this.getCellPosition(xIndex1, yIndex1);
  var br = this.getCellPosition(xIndex2, yIndex2, "br");
  
  return {
    width: Math.abs(br.x - tl.x),
    height: Math.abs(tl.y - br.y),
    cx: tl.x + Math.abs(br.x - tl.x) / 2,
    cy: tl.y - Math.abs(tl.y - br.y) / 2,
    x: tl.x,
    y: tl.y
  }
}

module.exports.prototype.getXRect = function(xIndex1, xIndex2, yIndex1, yIndex2){
  var tl = this.getCellPosition(xIndex1, yIndex1);
  var br = this.getCellPosition(xIndex2, yIndex2 || yIndex1, "br");
  
  return {
    width: br.x - tl.x,
    height: tl.y - br.y,
    cx: tl.x + (br.x - tl.x) / 2,
    cy: tl.y - (tl.y - br.y) / 2,
    x: tl.x,
    y: tl.y
  }
}

module.exports.prototype.getYRect = function(xIndex, yIndex1, yIndex2){
  var tl = this.getCellPosition(xIndex, yIndex1);
  var br = this.getCellPosition(xIndex, yIndex2, "br");
  
  return {
    width: br.x - tl.x,
    height: tl.y - br.y,
    cx: tl.x + (br.x - tl.x) / 2,
    cy: tl.y - (tl.y - br.y) / 2,
    x: tl.x,
    y: tl.y
  }
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
