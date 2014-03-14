var Planet = require("../../space/planets/Planet");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function(planetData) {
	var planet = this.cache.length > 0 ? this.cache.shift() : null;

	if (!planet)
		planet = new Planet(this.context);

	this.context.container.add(planet);
	planet.prepare(planetData)
	
	this.context.planetsHitObjects.push(planet.hitObject);
	this.context.objects.push(planet);
	this.context.objectsById[planetData.id] = planet;

	return planet;
}

module.exports.prototype.destroy = function(planet) {
	this.context.container.remove(planet);
	this.context.planetsHitObjects.splice(this.context.planetsHitObjects.indexOf(planet.hitObject), 1);
	this.context.objects.splice(this.context.objects.indexOf(planet), 1);

	delete this.context.objectsById[planet.data.id];

	this.cache.push(planet);

	return planet;
}