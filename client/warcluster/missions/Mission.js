module.exports = function(context){
	this.context = context;
}

module.exports.prototype.send = function(missionData) {
	console.log("-send-", source, target);
	for (var i = 0;i < 20;i ++) {
		var ship = this.context.shipsFactory.build(missionData);
		ship.position.x = sourcePlanets[k].position.x + Math.random() * 200 - 100;
		ship.position.y = sourcePlanets[k].position.y + Math.random() * 200 - 100;
		ship.position.z = 60;
		ship.send(target);
	}
}