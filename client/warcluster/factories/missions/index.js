var Mission = require("../../space/missions/Mission");

module.exports = function(context){
	this.context = context;

  this.formations = [
    [
      new THREE.Vector3(0, -100, 0),
      new THREE.Vector3(-70, 0, 0),
      new THREE.Vector3(70, 0, 0),
      new THREE.Vector3(-140, 100, 0),
      new THREE.Vector3(140, 100, 0)
    ],
    [
      new THREE.Vector3(0, -100, 0),
      new THREE.Vector3(-100, 0, 0),
      new THREE.Vector3(100, 0, 0),
      new THREE.Vector3(-50, 100, 0),
      new THREE.Vector3(50, 100, 0)
    ],
    [
      new THREE.Vector3(-50, -70, 0),
      new THREE.Vector3(50, -70, 0),
      new THREE.Vector3(100, 0, 0),
      new THREE.Vector3(-100, 0, 0),
      new THREE.Vector3(0, 70, 0)
    ]
  ];
}

module.exports.prototype.build = function(data) {
  if (data.ShipCount == 0)
    return;
  
  var formation = this.formations[parseInt(this.formations.length * Math.random())]
  var mission = new Mission(data, this.context);
  
  this.context.missions.push(mission);
  this.context.objectsById[data.id] = mission;

  mission.send(formation, data.Color);

  return mission;
}

module.exports.prototype.destroy = function(mission) {
  this.context.missions.splice(this.context.missions.indexOf(mission), 1);
  delete this.context.objectsById[mission.data.id];

  return mission;
}