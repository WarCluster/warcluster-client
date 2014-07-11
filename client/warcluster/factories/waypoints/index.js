var Waypoint = require("../../space/waypoint");

module.exports = function(context){
  this.context = context;
  this.cache = [];
}

module.exports.prototype.build = function() {
  var p = this.context.spaceViewController.getMousePosition();
  var waypoint = this.cache.length > 0 ? this.cache.shift() : new Waypoint(this.context);
  waypoint.position.x = p.x;
  waypoint.position.y = p.y;

  this.context.container.add(waypoint);

  return waypoint;
}

module.exports.prototype.destroy = function(waypoint) {
  this.context.container.remove(waypoint);

  return waypoint;
}