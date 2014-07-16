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
  debugger;
  // var colors = [0x0cff00, 0xff0000, 0x005aff, 0xf6ff00];
  // var color = new THREE.Color().setRGB(data.Color.R, data.Color.G, data.Color.B);

  // data.Color.R = color.r; 
  // data.Color.G = color.g;
  // data.Color.B = color.b;


  var formation = this.formations[parseInt(this.formations.length * Math.random())]
  var mission = new Mission(data, this.context);
  

  this.context.container.add(mission);
  this.context.objects.push(mission);
  this.context.objectsById[data.id] = mission;

  mission.send(formation, data.Color);

  return mission;
}

module.exports.prototype.destroy = function(mission) {
  this.context.container.remove(mission);
  this.context.objects.splice(this.context.objects.indexOf(mission), 1);

  delete this.context.objectsById[mission.data.id];

  return mission;
}