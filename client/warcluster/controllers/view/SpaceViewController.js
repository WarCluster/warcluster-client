var Scroller = require("./scroller");
var Selection = require("./selection");
var Zoomer = require("./zoomer");
var Info = require("./info");

module.exports = function(context, config){
	THREE.EventDispatcher.call(this);

	var self = this;

  this.context = context;
  
  this.zoomer = new Zoomer(context, config.zoomer);
  this.zoomer.addEventListener("scopeOfView", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
  });
  this.zoomer.addEventListener("zoom", function(e) {
    self.scroller.scaleIndex = e.zoom / 6000;
    //TODO: don't call scope of view everytime
    if (e.mode === "zoomin") {
      self.scroller.scrollToMousePosition(e.target.mousePosition.x, e.target.mousePosition.y);
    }
    self.dispatchEvent(e);
    self.info.updatePosition();
  });

  this.scroller = new Scroller(context, config.scroller);
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
  this.selection.addEventListener("spyPlanet", function(e) {
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

module.exports.prototype.setPosition = function (x, y) {
  this.scroller.setPosition(x, y);
}

module.exports.prototype.getResolution = function() {
  return {
    width: Math.ceil($(window).width()*this.scroller.scaleIndex), 
    height: Math.ceil($(window).height()*this.scroller.scaleIndex) 
  }
}