module.exports = function(data, context) {
  this.data = data;
  this.context = context;
  this.ships = [];
}

module.exports.prototype.send = function(formation, color) {
  var ship;
  var color = new THREE.Color().setRGB(color.R/255, color.G/255, color.B/255);

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

    this.ships.push(ship);
  }
}

module.exports.prototype.update = function(data) {
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

module.exports.prototype.destroy = function(ship) {
  var index = this.ships.indexOf(ship);
  this.ships.splice(index, 1);

  this.context.shipsFactory.destroy(ship);

  if (this.ships.length == 0)
    this.context.missionsFactory.destroy(this);

  return ship;
}