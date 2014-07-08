var Planet = require("../../space/planets/Planet");

module.exports = function(context){
	this.context = context;
	this.cache = [];

	this.allIds = [];
	this.removedIds = [];

	this.totalPerId = {};
}

module.exports.prototype.build = function(planetData) {
	console.log("build:", planetData.id, planetData)
	var planet = this.cache.length > 0 ? this.cache.shift() : new Planet(this.context);
	planet.prepare(planetData);
	
	this.context.container.add(planet);
	
	this.context.planetsHitObjects.push(planet.hitObject);
	this.context.objects.push(planet);
	this.context.objectsById[planetData.id] = planet;

	this.allIds.push(planetData.id);

	return planet;
}

module.exports.prototype.destroy = function(planet) {
	if (typeof this.totalPerId[planet.data.id] == "undefined")
		this.totalPerId[planet.data.id] = 1;
	else
		this.totalPerId[planet.data.id] ++;

	if (this.totalPerId[planet.data.id] > 1)
		console.log(" -----------------************* BULL SHIT *************-------------");

	this.context.container.remove(planet);
	
	this.context.planetsHitObjects.splice(this.context.planetsHitObjects.indexOf(planet.hitObject), 1);
	this.context.objects.splice(this.context.objects.indexOf(planet), 1);

	if (!this.context.objectsById[planet.data.id]) {
		console.log("2.************* SHIT *************", this.totalPerId[planet.data.id], planet.data.id, this.allIds.indexOf(planet.data.id), this.removedIds.indexOf(planet.data.id))
	}

	delete this.context.objectsById[planet.data.id];
	this.removedIds.push(planet.data.id);
	if (this.context.objectsById[planet.data.id])
		console.log("3.************* SHIT *************");
	this.cache.push(planet);

	return planet;
}