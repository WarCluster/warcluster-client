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
  this.startPosition = new THREE.Vector3();

  this.xIndex = 0;
  this.yIndex = 0;

  this.gridWidth = 1000;
  this.gridHeight = 1000;

  this.zoomer = new Zoomer(context, config.zoomer, this);
  this.zoomer.addEventListener("scopeOfView", function(e) {
    self.scroller.scaleIndex = e.zoom;
    self.dispatchEvent(e);
    self.info.updatePosition();
    self.refreshIndexes();
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
    self.refreshIndexes();;
  });
  this.scroller.addEventListener("scopeOfView", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
    self.refreshIndexes();
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
    this.xIndex = p.xIndex;
    this.yIndex = p.yIndex;
    console.log("#### ACTIVATE:", p.xIndex, p.yIndex)
    var rect = this.getScreenRectangle(this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y);
    this.context.commandsManager.scopeOfView({
      x: rect.cx,
      y: rect.cy
    }, {
      width: rect.width - 1,
      height: rect.height - 1,
    });
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
  var xIndex = x / this.gridWidth || 1;
  var yIndex = y / this.gridHeight || 1;
  return {
    xIndex: xIndex > 0 ? Math.ceil(xIndex) : Math.floor(xIndex),
    yIndex: yIndex > 0 ? Math.ceil(yIndex) : Math.floor(yIndex)
  }
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

module.exports.prototype.getScreenRectangle = function(x, y) {
  var gPosition = this.getGridPosition(this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y);
  var resolution = this.getResolution();
  //resolution.width += this.gridWidth * 2;
  //resolution.height += this.gridHeight * 2;

  var iw = Math.floor(Math.ceil(resolution.width / this.gridWidth) / 2);
  var ih = Math.floor(Math.ceil(resolution.height / this.gridHeight) / 2);

  var width = (iw * 2 + 1) * this.gridWidth;
  var height = (ih * 2 + 1) * this.gridHeight;

  var tl = this.getCellPosition(gPosition.xIndex - iw, gPosition.yIndex + ih);


  var data = {
    width: width,
    height: height,
    cx: tl.x + (width / 2),
    cy: tl.y - (height / 2),
    x: tl.x,
    y: tl.y
  }

  console.log("1.getScreenRectangle", x, y, iw, ih, resolution, tl, Math.ceil(resolution.height / this.gridHeight))
  console.log("2.getScreenRectangle", data)

  //resolution.width += this.gridWidth * 2;
  //resolution.height += this.gridHeight * 2;
  /*var x1 = x - resolution.width / 2;
  var y1 = y + resolution.height / 2;

  var x2 = x + resolution.width / 2;
  var y2 = y - resolution.height / 2;
  var gtl = this.getGridPosition(x1, y1);
  var gbr = this.getGridPosition(x2, y2);

  var tl = this.getCellPosition(gtl.xIndex, gtl.yIndex);
  var br = this.getCellPosition(gbr.xIndex, gbr.yIndex, "br");
  
  var data = {
    width: br.x - tl.x,
    height: tl.y - br.y,
    cx: tl.x + (br.x - tl.x) / 2,
    cy: tl.y - (tl.y - br.y) / 2,
    x: tl.x,
    y: tl.y
  }

  console.log("1.getScreenRectangle", x, y, resolution, tl, br)
  console.log("2.getScreenRectangle", x1, y1, x2, y2, gtl, gbr)*/

  return data;
}

module.exports.prototype.translateIndex = function(i, d) {
  if (i > 0 && i + d < 1)
    return i + d - 1;
  else if (i < 0 && i + d > -1)
    return i + d + 1;
  return i + d;
}

module.exports.prototype.indexDistance = function(i1, i2) {
  if (i1 == i2)
    return 0;

  var ii1 = i1;
  var ii2 = i2;

  i1 = Math.min(ii1, ii2);
  i2 = Math.max(ii1, ii2);

  if (i1 > 0 && i2 > 0)
    return i2 - i1 - 1;
  else if (i1 < 0 && i2 < 0)
    return i2 - i1 - 1;
  else if (i1 < 0 && i2 > 0)
    return i2 - 1 + i1 + 1;
  //else if (i1 > 0 && i2 < 0)
  return i2 + 1 + i1 - 1;
}

module.exports.prototype.scopeOfView = function(rect) {
  this.context.commandsManager.scopeOfView({
    x: rect.cx,
    y: rect.cy
  }, {
    width: rect.width - 1,
    height: rect.height - 1,
  });
}

module.exports.prototype.refreshIndexes = function() {
  console.log("------------------------ refreshIndexes --------------------------")
  var resolution = this.getResolution();
  //resolution.width += this.gridWidth * 2;
  //resolution.height += this.gridHeight * 2;
  var gPosition = this.getGridPosition(this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y);

  var iw = Math.floor(Math.ceil(resolution.width / this.gridWidth) / 2);
  var ih = Math.floor(Math.ceil(resolution.height / this.gridHeight) / 2);

  var gtl = {
    xIndex: this.translateIndex(gPosition.xIndex, -iw),
    yIndex: this.translateIndex(gPosition.yIndex, ih),
  };
  var gbr = {
    xIndex: this.translateIndex(gPosition.xIndex, iw),
    yIndex: this.translateIndex(gPosition.yIndex, -ih),
  };

  var changed = false;
  var ix = this.indexDistance(gPosition.xIndex, this.xIndex);
  var iy = this.indexDistance(gPosition.yIndex, this.yIndex);

  var ix2 = gPosition.xIndex;
  var iy2 = gPosition.yIndex;

  var ix3 = this.xIndex;
  var iy3 = this.yIndex;

  /*if (ix > 0)
    ix --;
  else if (ix < 0)
    ix ++;

  if (iy > 0)
    iy --;
  else if (iy < 0)
    iy ++;*/

  if (gPosition.xIndex < this.xIndex) {
    var addRect = this.getRect(gtl.xIndex - ix, gtl.yIndex, gtl.xIndex, gbr.yIndex);
    var removeRect = this.getRect(this.translateIndex(gbr.xIndex, 1), gtl.yIndex, this.translateIndex(gbr.xIndex, 1 + ix), gbr.yIndex);
    console.log("1X:ADD:", gtl.xIndex, addRect)
    console.log("1X:REMOVE:", this.translateIndex(gbr.xIndex, 1), removeRect)

    this.context.spaceScene.gc(removeRect);
    this.scopeOfView(addRect);
    changed = true;

  } else if (gPosition.xIndex > this.xIndex) {
    var addRect = this.getRect(gbr.xIndex, gtl.yIndex, this.translateIndex(gbr.xIndex, ix), gbr.yIndex);
    var removeRect = this.getRect(this.translateIndex(gtl.xIndex, -1 - ix), gtl.yIndex, this.translateIndex(gtl.xIndex, -1), gbr.yIndex);
    console.log("2X:ADD:", gbr.xIndex, addRect)
    console.log("2X:REMOVE:", this.translateIndex(gtl.xIndex, -1), this.translateIndex(gtl.xIndex, -1 - ix), removeRect)

    this.context.spaceScene.gc(removeRect);
    this.scopeOfView(addRect);
    changed = true;
  }

  this.xIndex = gPosition.xIndex;

  if (gPosition.yIndex < this.yIndex) {
    var addRect = this.getRect(gtl.xIndex, gbr.yIndex, gbr.xIndex, this.translateIndex(gbr.yIndex, -iy));
    var removeRect = this.getRect(gtl.xIndex, this.translateIndex(gtl.yIndex, 1 + iy), gbr.xIndex, this.translateIndex(gtl.yIndex, 1));
    console.log("1Y:ADD:", gbr.yIndex, this.translateIndex(gbr.yIndex, -1), addRect)
    console.log("1Y:REMOVE:", this.translateIndex(gtl.yIndex, 1), this.translateIndex(gtl.yIndex, 1 + iy), removeRect)

    this.context.spaceScene.gc(removeRect);
    this.scopeOfView(addRect);
    changed = true;

  } else if (gPosition.yIndex > this.yIndex) {
    var addRect = this.getRect(gtl.xIndex, this.translateIndex(gtl.yIndex, iy), gbr.xIndex, gtl.yIndex);
    var removeRect = this.getRect(gtl.xIndex, this.translateIndex(gbr.yIndex, -1), gbr.xIndex, this.translateIndex(gbr.yIndex, -1 - iy));

    console.log("2Y:ADD:", gtl.yIndex, this.translateIndex(gtl.yIndex, iy), addRect)
    console.log("2Y:REMOVE:", this.translateIndex(gbr.yIndex, -1), this.translateIndex(gbr.yIndex, -1 - iy), removeRect)

    this.context.spaceScene.gc(removeRect);
    this.scopeOfView(addRect);
    changed = true;
  }
  
  this.yIndex = gPosition.yIndex;

  if (changed) {
    console.log("# INDEXES:", gPosition.xIndex, gPosition.yIndex, iw, ih, "|", ix, iy, "|", ix2, iy2, "|", ix2, ix3, iy2, iy3);
    //console.log("# INDEXES:", iw, ih, this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y, resolution.width, resolution.height, resolution.width / 2, resolution.height / 2, gPosition.xIndex, gPosition.yIndex, gtl, gbr)
    //console.log("# POSITIONS:", this.getCellPosition(xIndex, yIndex), this.getCellPosition(xIndex, yIndex, "tr"), this.getCellPosition(xIndex, yIndex, "br"), this.getCellPosition(xIndex, yIndex, "bl"))
    //console.log("# RECT:", this.getScreenRectangle(this.context.spaceScene.camera.position.x, this.context.spaceScene.camera.position.y))
    
    //console.log("#", "("+(gPosition.xIndex - 1)+", "+(gPosition.yIndex - 1)+")", "("+gPosition.xIndex+", "+(gPosition.yIndex - 1)+")", "("+(gPosition.xIndex + 1)+", "+(gPosition.yIndex - 1)+")")
    //console.log("#", "("+(gPosition.xIndex - 1)+", "+(gPosition.yIndex)+")", "("+gPosition.xIndex+", "+(gPosition.yIndex)+")", "("+(gPosition.xIndex + 1)+", "+(gPosition.yIndex)+")")
    //console.log("#", "("+(gPosition.xIndex - 1)+", "+(gPosition.yIndex + 1)+")", "("+gPosition.xIndex+", "+(gPosition.yIndex + 1)+")", "("+(gPosition.xIndex + 1)+", "+(gPosition.yIndex + 1)+")")  
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

