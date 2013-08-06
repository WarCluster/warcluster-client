module.exports = function(context){
	this.context = context;
}

module.exports.prototype.send = function(missionData) {
	console.log("-send-", missionData);
	for (var i = 0;i < 20;i ++) {
		var ship = this.context.shipsFactory.build(missionData);
		ship.position.x = missionData.x + Math.random() * 200 - 100;
		ship.position.y = missionData.y + Math.random() * 200 - 100;
		ship.position.z = 60;
		ship.send(target);
	}
}