var Planet = require("../../space-objects/planets/Planet");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function(data) {
	var planet = this.cache.length > 0 ? this.cache.shift() : null;

	if (!planet)
		planet = new Planet(this.context, data);

	this.context.container.add(planet);
	
	this.context.planetsHitObjects.push(planet.hitObject);
	this.context.interactiveObjects.push(planet);
	this.context.objects.push(planet);

	return planet;
}

module.exports.prototype.destroy = function(planet) {
	this.context.container.remove(planet);
	
	this.context.planetsHitObjects.splice(this.context.planetsHitObjects.indexOf(planet.hitObject), 1);
	this.context.interactiveObjects.splice(this.context.interactiveObjects.indexOf(planet.hitObject), 1);
	this.context.objects.splice(this.context.objects.indexOf(planet), 1);

	this.cache.push(planet);

	return planet;
}