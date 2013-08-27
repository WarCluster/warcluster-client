module.exports = function(data, context) {
  this.data = data;
  this.context = context;
  this.ships = [];
}

module.exports.prototype.send = function(formation) {
  var ship;
  var color = new THREE.Color((0xffffff * 0.7) + (0xffffff * 0.3) * Math.random());

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

  console.log("send-mission:", step, sizes, this.data)

  for (var i = 0;i < sizes.length;i ++) {
    ship = this.context.shipsFactory.build(sizes[i], this, color, formation[i]);
    ship.send();

    this.ships.push(ship);
  }
}

module.exports.prototype.update = function(data) {
}

module.exports.prototype.getSize = function(ships) {
  if (ships > 10 && ships <= 50)
    return 2;
  else if (ships > 50 && ships <= 100)
    return 3;
  else if (ships > 100 && ships <= 200)
    return 4;
  else if (ships > 200)
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