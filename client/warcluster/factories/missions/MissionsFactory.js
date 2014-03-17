var Mission = require("../../space/missions/Mission");
var Ship = require("../../space/ships/Ship");

module.exports = function(context){
  this.context = context;
  this.cache = [];
}

module.exports.prototype.build = function(missionData) {
  var mission = this.cache.length > 0 ? this.cache.shift() : new Mission(this.context);

  this.context.container.add(mission);
  mission.send(missionData)
  
  this.context.objects.push(mission);
  this.context.objectsById[missionData.id] = mission;

  return mission;
}

module.exports.prototype.destroy = function(mission) {
  mission.deactivate();

  this.context.container.remove(mission);
  this.context.objects.splice(this.context.objects.indexOf(mission), 1);

  delete this.context.objectsById[mission.data.id];
  this.cache.push(mission);

  return mission;
}