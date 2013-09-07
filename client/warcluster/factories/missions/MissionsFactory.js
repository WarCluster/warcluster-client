var Mission = require("../../space/missions/Mission");

module.exports = function(context){
	this.context = context;

  this.formations = [
    [
      {x: 0, y: -100, z: 0},
      {x: -70, y: 0, z: 100},
      {x: 70, y: 0, z: 100},
      {x: -140, y: 100, z: -100},
      {x: 140, y: 100, z: -100}
    ],
    [
      {x: 0, y: -100, z: 0},
      {x: -100, y: 0, z: 100},
      {x: 100, y: 0, z: 100},
      {x: -50, y: 100, z: -200},
      {x: 50, y: 100, z: -200}
    ],
    [
      {x: -50, y: -70, z: 0},
      {x: 50, y: -70, z: 0},
      {x: 100, y: 0, z: 100},
      {x: -100, y: 0, z: 100},
      {x: 0, y: 70, z: -100}
    ]
  ];
}

module.exports.prototype.build = function(data) {
  if (data.ShipCount == 0)
    return;
  var formation = this.formations[parseInt(this.formations.length * Math.random())]
  var mission = new Mission(data, this.context);

  this.context.objectsById[data.id] = mission;
  mission.send(formation, data.Color);

  return mission;
}

module.exports.prototype.destroy = function(mission) {
  delete this.context.objectsById[mission.data.id];
  return mission;
}