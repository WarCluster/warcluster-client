var Ship = require("../../space/ships/Ship");

module.exports = function(context){
	this.context = context;
	this.cache = {};
}

module.exports.prototype.build = function(size, mission, color, formation) {
	if (!this.cache[size])
		this.cache[size] = new Array();

	var ship = this.cache[size].length > 0 ? this.cache[size].shift() : new Ship(size, this.context);
	ship.prepare(formation, color);

	return ship;
}

module.exports.prototype.destroy = function(ship) {
	this.cache[ship.size].push(ship);
	return ship;
}