module.exports = function(data, context) {
  this.data = data;
  this.context = context;
  this.ships = [];
}

module.exports.prototype.send = function(formation) {
  var ship;
  var color = new THREE.Color((0xffffff * 0.7) + (0xffffff * 0.3) * Math.random());

  for (var i = 0;i < 5;i ++) {
    ship = this.context.shipsFactory.build(this, color, formation[i]);
    ship.send();

    this.ships.push(ship);
  }
}

module.exports.prototype.update = function(data) {
}

module.exports.prototype.destroy = function(ship) {
  var index = this.ships.indexOf(ship);
  this.ships.splice(index, 1);

  this.context.shipsFactory.destroy(ship);

  if (this.ships.length == 0)
    this.context.missionsFactory.destroy(this);

  return ship;
}