var Ship = require("../../ships/Ship");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function(total) {
	var ship = this.cache.length > 0 ? this.cache.shift() : null;

	if (!ship)
		ship = new Ship(this.context);

	ship.prepare(total);
	this.context.container.add(ship);
	this.context.interactiveObjects.push(ship);

	return ship;
}

module.exports.prototype.destroy = function(ship) {
	this.context.container.remove(ship);
	this.context.interactiveObjects.splice(this.context.interactiveObjects.indexOf(ship), 1);

	this.cache.push(ship);

	return ship;
}