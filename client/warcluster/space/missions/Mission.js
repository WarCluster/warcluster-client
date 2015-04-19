module.exports = function(data, context) {

	this.context = context;
	this.data = data;
	this.ships = [];

	this.progress = 0;
	this.delta_x = 0;
	this.delta_y = 0;
  this.angle = 0;

	this.formation = null;
}

module.exports.prototype.send = function(formation, Color) {
	this.delta_x = this.data.Target.Position.X - this.data.Source.Position.X;
	this.delta_y = this.data.Target.Position.Y - this.data.Source.Position.Y;
	this.angle = -Math.atan2(this.delta_x, this.delta_y) + Math.PI;

	this.endTime = this.data.StartTime + this.data.TravelTime;

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

  this.ships = this.context.shipsManager.addShips(sizes, this, color, formation);
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

module.exports.prototype.isForRemove = function() {
  //if (!!(this.context.currentTime > this.endTime))
    //console.log("-isForRemove-", this.context.currentTime, this.endTime)


  if (this.context.currentTime > this.endTime) {
    //console.log("1.-isForRemove-")
    return true;
  } else {

    this.progress = (this.context.currentTime - this.data.StartTime) / this.data.TravelTime;

    if (this.progress > 1)
      this.progress = 1;

    this.x = this.data.Source.Position.X + this.delta_x * this.progress;
    this.y = this.data.Source.Position.Y + this.delta_y * this.progress;

    var rect = this.context.spaceViewController.screenRect;

    if (!(this.x >= rect.x && this.x <= rect.x + rect.width && this.y <= rect.y && this.y >= rect.y - rect.height)) {
      //console.log("2.-isForRemove-")
      return true;
    }
  }
  //console.log("3.-isForRemove-", this.context.currentTime > this.endTime ? "YES" : "SHIT")
  return false;
}

/*module.exports.prototype.destroy = function() {
  //console.log("-destroy-", this.ships)
  //while (this.ships.length > 0)
		this.context.shipsManager.removeShips(this.ships);

  var shs = this.ships;
  this.ships = null;
  //this.context.missionsFactory.destroy(this);

  return shs;
}*/

module.exports.prototype.getSize = function(ships) {
  if (ships > 500 && ships <= 1500)
    return 1;
  else if (ships > 1500 && ships <= 3000)
    return 2;
  else if (ships > 3000 && ships <= 6000)
    return 3;
  else if (ships > 6000)
    return 4;

  return 0;
}