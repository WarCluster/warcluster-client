var Mission = require("../../missions/Mission");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function() {
	var mission = this.cache.length > 0 ? this.cache.shift() : null;

	if (!mission)
		mission = new Mission(this.context);

	return mission;
}

module.exports.prototype.destroy = function(mission) {
	this.cache.push(mission);

	return mission;
}