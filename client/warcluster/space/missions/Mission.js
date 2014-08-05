module.exports = function(data, context) {
	
	this.context = context;
	this.data = data;
	this.ships = [];

	this.progress = 0;
	this.delta_x = 0;
	this.delta_y = 0;

	this.formation = null;
}

module.exports.prototype.send = function(formation, Color) {
	this.delta_x = this.data.Target.Position.X - this.data.Source.Position.X;
	this.delta_y = this.data.Target.Position.Y - this.data.Source.Position.Y;
	
	this.endTime = this.data.StartTime + this.data.TravelTime;

	var ship;
  var color = new THREE.Color().setRGB(Color.R, Color.G, Color.B);

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

  this.ships = this.context.shipsFactory.build(sizes, this, color, formation);
}

module.exports.prototype.removeShipsIfNecessary = function() {
  if (this.context.currentTime > this.endTime) {
    //console.log("1.-removeShipsIfNecessary-", this.context.currentTime, this.endTime)
    this.destroy();
  } else {
    this.progress = (this.context.currentTime - this.data.StartTime) / this.data.TravelTime;
    
    if (this.progress > 1)
      this.progress = 1;

    this.x = this.data.Source.Position.X + this.delta_x * this.progress;
    this.y = this.data.Source.Position.Y + this.delta_y * this.progress;

    var rect = this.context.spaceViewController.screenRect;

    if (!(this.x >= rect.x && this.x <= rect.x + rect.width &&
        this.y <= rect.y && this.y >= rect.y - rect.height)) {
      //console.log("2.-removeShipsIfNecessary-", this.progress)
      this.destroy();
    }
      
  }
}

module.exports.prototype.destroy = function() {
  //console.log("-destroy-", this.ships)
  while (this.ships.length > 0)
		this.context.shipsManager.removeShips(this.ships);

  this.ships = null;
  this.context.missionsFactory.destroy(this);
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