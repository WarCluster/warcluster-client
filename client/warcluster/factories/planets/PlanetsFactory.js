var Planet = require("../../planets/Planet");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function() {
	var planet = this.cache.length > 0 ? this.cache.shift() : null;

	if (!planet)
		planet = new Planet(this.context);

	this.context.container.add(planet);
	
	this.context.hitObjects.push(planet.hitObject);
	this.context.interactiveObjects.push(planet);

	return planet;
}

module.exports.prototype.destroy = function(planet) {
	this.context.container.remove(planet);
	this.context.hitObjects.splice(this.context.hitObjects.indexOf(planet.hitObject), 1);
	this.context.interactiveObjects.splice(this.context.interactiveObjects.indexOf(planet), 1);

	this.cache.push(planet);

	return planet;
}