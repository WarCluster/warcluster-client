module.exports = function(context){
	this.context = context;
	this.total = 0;
}

module.exports.prototype.send = function(sourcePlanets, target) {
	console.log("-send-", sourcePlanets.length);
	for (var k = 0;k < sourcePlanets.length;k ++) {
		if (sourcePlanets[k].data.ShipCount > 10)	{
			this.total += 10;
			for (var i = 0;i < 20;i ++) {
				var ship = this.context.shipsFactory.build();
				ship.position.x = sourcePlanets[k].position.x + Math.random() * 200 - 100;
				ship.position.y = sourcePlanets[k].position.y + Math.random() * 200 - 100;
				ship.position.z = 60;
				ship.send(target);
			}
		}

		console.log("this.total:", this.total);
	}
}