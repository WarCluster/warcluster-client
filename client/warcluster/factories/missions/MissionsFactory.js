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

module.exports.prototype.build = function(missionData) {
  var ts = missionData.totalShips;
  var step = 1;

  if (missionData.totalShips <= 10) {
      step = 2;
    } else if (missionData.totalShips <= 100) {
      step = 20;
    } else if (missionData.totalShips <= 1000) {
      step = 200;
    } else if (missionData.totalShips <= 10000) {
      step = 2000;
    } else if (missionData.totalShips <= 100000) {
      step = 20000;
    } else if (missionData.totalShips <= 1000000) {
      step = 200000;
    } else if (missionData.totalShips <= 10000000) {
      step = 2000000;
    }

  var ship;
  var color = new THREE.Color((0xffffff * 0.7) + (0xffffff * 0.3) * Math.random());
  var formation = this.formations[parseInt(this.formations.length * Math.random())]

  for (var i = 0;i < 5;i ++) {
    
    if (ts - step >= 0) {
      ship = this.context.shipsFactory.build(step, color, formation[i]);
    } else {
      ship = this.context.shipsFactory.build(ts, color, formation[i]);
    }

    ts -= step;
    
    ship.send(missionData);
  }
}