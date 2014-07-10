var InteractiveObject = require("../InteractiveObject");

module.exports = function(data, context) {
	InteractiveObject.call(this);
	
	this.context = context;
	this.data = data;
	this.ships = [];

	this.progress = 0;
	this.delta_x = 0;
	this.delta_y = 0;

	this.direction = Math.random() > 0.5 ? 1 : -1;
	this.angle = Math.random() * 360;
	this.formation = null;
}

module.exports.prototype = new InteractiveObject();
module.exports.prototype.send = function(formation, color) {
	this.delta_x = this.data.Target.Position.X - this.data.Source.Position.X;
	this.delta_y = this.data.Target.Position.Y - this.data.Source.Position.Y;
	
	this.rotation.z = -Math.atan2(this.delta_x, this.delta_y) + Math.PI;
	//this.ship.rotation.y = Math.PI * Math.random();

	this.endTime = this.data.StartTime + this.data.TravelTime;

	var ship;
  var color = new THREE.Color().setRGB(color.R, color.G, color.B);

  var totalShips = this.data.ShipCount;
  var step = Math.ceil(this.data.ShipCount / 5);

  var sizes = [];

  for (var i = 0;i < 5;i ++) {
    if (totalShips - step > 0) {
      totalShips -= step;
      sizes.push(this.getSize(step));
    } else {
      sizes.push(this.getSize(totalShips));
      break;
    }
  }

  for (var i = 0;i < sizes.length;i ++) {
    ship = this.context.shipsFactory.build(sizes[i], this, color, formation[i]);
    ship.send();

    this.add(ship);
    this.ships.push(ship);
  }

  this.activate();
}

module.exports.prototype.tick = function() {
	if (this.context.currentTime > this.endTime) {
		this.destroy();
	} else {
		this.progress = (this.context.currentTime - this.data.StartTime) / this.data.TravelTime;

		if (this.progress > 1)
			this.progress = 1;

		this.position.x = this.data.Source.Position.X + this.delta_x * this.progress;
		this.position.y = this.data.Source.Position.Y + this.delta_y * this.progress;

		for (var i = 0;i < this.ships.length;i ++)
			this.ships[i].tick(this.progress);
	}
}
module.exports.prototype.getSize = function(ships) {
  if (ships > 100 && ships <= 200)
    return 2;
  else if (ships > 200 && ships <= 500)
    return 3;
  else if (ships > 500 && ships <= 1000)
    return 4;
  else if (ships > 1000)
    return 5;

  return 1;
}

module.exports.prototype.update = function(data) {
}

module.exports.prototype.destroy = function() {
	this.deactivate();
	console.log("-destroy-", this.ships.length)
  while (this.ships.length > 0)
		this.context.shipsFactory.destroy(this.ships.shift());

  this.context.missionsFactory.destroy(this);
}