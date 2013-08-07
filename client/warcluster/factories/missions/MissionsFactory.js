module.exports = function(context){
	this.context = context;
}

module.exports.prototype.build = function(missionData) {
  var ts = missionData.totalShips;
  var step = 1;

  if (missionData.totalShips <= 10) {
      step = 1;
    } else if (missionData.totalShips <= 100) {
      step = 10;
    } else if (missionData.totalShips <= 1000) {
      step = 100;
    } else if (missionData.totalShips <= 10000) {
      step = 1000;
    } else if (missionData.totalShips <= 100000) {
      step = 10000;
    } else if (missionData.totalShips <= 1000000) {
      step = 100000;
    } else if (missionData.totalShips <= 10000000) {
      step = 1000000;
    }

  var ship;

  for (var i = 0;i < 10;i ++) {
    
    if (ts - step >= 0) {
      ship = this.context.shipsFactory.build(step);
    } else {
      ship = this.context.shipsFactory.build(ts);
    }

    ts -= step;
    
    ship.position.z = 260;
    ship.send(missionData);
  }
}