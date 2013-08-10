var Scroller = require("./scroller");
var Selection = require("./selection");
var Zoomer = require("./zoomer");
var Info = require("./info");

module.exports = function(context, config){
	THREE.EventDispatcher.call(this);

	var self = this;

  this.context = context;

  this.zoomer = new Zoomer(context, config.zoomer);
  this.zoomer.addEventListener("zoom", function(e) {
    self.scroller.scaleIndex = e.zoom / 6000;
    self.dispatchEvent(e);
    self.info.updatePosition();
  });

  this.scroller = new Scroller(context, config.scroller);
  this.scroller.addEventListener("scroll", function(e) {
    self.dispatchEvent(e);
    self.info.updatePosition();
  });

  this.selection = new Selection(context, config.selection);
  this.selection.addEventListener("attackPlanet", function(e) {
    self.dispatchEvent(e);
  });
  this.selection.addEventListener("supportPlanet", function(e) {
    self.dispatchEvent(e);
  });

  this.info = new Info(context);

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