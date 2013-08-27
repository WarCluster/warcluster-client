var Ship = require("../../space/ships/Ship");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function(mission, color, formationPosition) {
	// console.log("cache:", this.cache.length)
	var ship = this.cache.length > 0 ? this.cache.shift() : new Ship(this.context);
	ship.mission = mission;
	ship.material.color = color;
	ship.material.ambient = color;
	ship.formation = formationPosition;
	ship.activate();

	this.context.container.add(ship);
	this.context.objects.push(ship);

	return ship;
}

module.exports.prototype.destroy = function(ship) {
	ship.deactivate();

	this.context.container.remove(ship);
	this.context.objects.splice(this.context.objects.indexOf(ship), 1);

	this.cache.push(ship);

	return ship;
}