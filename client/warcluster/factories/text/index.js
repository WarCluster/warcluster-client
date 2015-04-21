module.exports = function(useGlobalCanvas, context){
  if (useGlobalCanvas && !module.exports.canvas)
    module.exports.canvas = document.createElement('canvas');

  this.canvas2d = useGlobalCanvas ? module.exports.canvas : document.createElement('canvas');
  this.canvas2d.globalAlpha = 0;
  this.context2d = this.canvas2d.getContext('2d');
  this.uint8Array = null;
}

module.exports.prototype.build = function(text, font, size) {
	var textHandler = text;
  var gradient = "white";
  var populations = text.split("/");

  if (textHandler === "")
    textHandler = " "

  font = font || "Ubuntu";
  size = size || 20;


  if (populations.length > 1) {
    //Indicate with red the current population if it's more than the max ship count
    if (parseInt(populations[0]) > parseInt(populations[1])) {
      var currentPopulationMeasure = this.context2d.measureText(populations[0]).width;
      gradient = this.context2d.createLinearGradient(0,0,currentPopulationMeasure,0);
      gradient.addColorStop(0.99, "red");
      gradient.addColorStop(0.99, "white");
    }
  }

  this.canvas2d.width = this.context2d.measureText(textHandler).width;
  this.canvas2d.height = size*2;
  this.canvas2d.fillStyle = "rgba(0, 0, 0, 0)";
  this.context2d.font = size + 'pt ' + font;
  this.context2d.fillStyle = gradient;
  this.context2d.textAlign = "center";
  this.context2d.textBaseline = "middle";

  this.context2d.fillText(textHandler, this.canvas2d.width / 2, this.canvas2d.height / 2);

	return this;
}
module.exports.prototype.buildNumber = function(text, font, size) {
  var textHandler = text;
  var gradient = "white";

  font = font || "Ubuntu";
  size = size || 20;

  this.canvas2d.width = this.context2d.measureText(textHandler).width;
  this.canvas2d.height = size*2;
  this.canvas2d.fillStyle = "rgba(0, 0, 0, 0)";
  this.context2d.font = size + 'pt ' + font;
  this.context2d.fillStyle = gradient;
  this.context2d.textAlign = "center";
  this.context2d.textBaseline = "middle";

  this.context2d.fillText(textHandler, this.canvas2d.width / 2, this.canvas2d.height / 2);

  return this;
}

module.exports.prototype.buildUint8Array = function(text, font, size) {
  if (typeof text === "number") {
    this.buildNumber(text, font, size)
  } else {
    this.build(text, font, size);
  }
  this.uint8Array = new Uint8Array(this.context2d.getImageData(0, 0, this.canvas2d.width, this.canvas2d.height).data.buffer);
  return this;
}

module.exports.canvas = null;