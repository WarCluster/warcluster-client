var Planet = require("../../space/planets/Planet");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function(planetData, selected) {
	var success = this.context.spaceViewController.selection.updateSelectedPlanetData(planetData);
	if (this.cache.length == 0)
		console.log("# build new planet:")
	var planet = this.cache.length > 0 ? this.cache.shift() : new Planet(this.context);

	planet.prepare(planetData);
	
	if (!planet.parent)
		this.context.container.add(planet);
	
	planet.visible = true;
	this.context.planetsHitObjects.push(planet.hitObject);
	this.context.objects.push(planet);
	this.context.objectsById[planetData.id] = planet;

	if (success)
		planet.select();

	return planet;
}

module.exports.prototype.destroy = function(planet) {
	planet.deactivate();
	planet.deselect();
	//this.context.container.remove(planet);
	planet.visible = false;
	
	this.context.planetsHitObjects.splice(this.context.planetsHitObjects.indexOf(planet.hitObject), 1);
	this.context.objects.splice(this.context.objects.indexOf(planet), 1);

	delete this.context.objectsById[planet.data.id];
	
	this.cache.push(planet);

	return planet;
}