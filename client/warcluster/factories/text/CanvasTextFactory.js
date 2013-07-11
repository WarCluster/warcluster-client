module.exports = function(context){
	this.context = context;
	this.result = {
		canvas2d: null,
		context2d: null,
	};
}

module.exports.prototype.build = function(text, font, size) {
	var canvas2d = this.context.cTemp[0];
	var context2d = canvas2d.getContext('2d');

	font = !font ? "Ubuntu" : font;
	size = !size ? 20 : size;

    canvas2d.width = context2d.measureText(text).width;
    canvas2d.height = size*2;
	
    context2d.font = size + 'pt ' + font;
    context2d.fillStyle = 'white';
    context2d.textAlign = "center";
    context2d.textBaseline = "middle";
	    
    context2d.fillText(text, canvas2d.width / 2, canvas2d.height / 2);
	
    this.result.canvas2d = canvas2d;
    this.result.context2d = context2d;

	return this.result;
}