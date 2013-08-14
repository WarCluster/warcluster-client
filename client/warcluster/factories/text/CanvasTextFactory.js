module.exports = function(useGlobalCanvas, context){
  if (useGlobalCanvas && !module.exports.canvas)
    module.exports.canvas = document.createElement('canvas');

  this.canvas2d = useGlobalCanvas ? module.exports.canvas : document.createElement('canvas');
  this.context2d = this.canvas2d.getContext('2d');
  this.uint8Array = null;
}

module.exports.prototype.build = function(text, font, size) {
	var textHandler = text;

	if (textHandler === "")
		textHandler = " "

	font = font || "Ubuntu";
	size = size || 20;

  this.canvas2d.width = this.context2d.measureText(textHandler).width;
  this.canvas2d.height = size*2;

  this.context2d.font = size + 'pt ' + font;
  this.context2d.fillStyle = 'white';
  this.context2d.textAlign = "center";
  this.context2d.textBaseline = "middle";

  this.context2d.fillText(textHandler, this.canvas2d.width / 2, this.canvas2d.height / 2);

	return this;
}

module.exports.prototype.buildUint8Array = function(text, font, size) {
  this.build(text, font, size);
  this.uint8Array = new Uint8Array(this.context2d.getImageData(0, 0, this.canvas2d.width, this.canvas2d.height).data.buffer);
  return this;
}

module.exports.canvas = null;