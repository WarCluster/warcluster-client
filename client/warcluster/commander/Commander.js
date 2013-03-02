module.exports = function(battleField){
  this.battleField = battleField;
}

module.exports.prototype.getRadialPosition = function(x, y, r, angle) {
  return {
    x: x + r * Math.sin(angle*(Math.PI/180)),
    y: y - r * Math.cos(angle*(Math.PI/180)) * 0.6
  };
}

module.exports.prototype.buildSystemsData = function(total, d, x, y) {
  var data = d ? d : {
    objects: [],
    missions: []
  };

  x = x ? x : 0;
  y = y ? y : 0;

  var plength = parseInt(Math.random() * 8);
  var step = 120;

  for (var i = 0;i < total;i ++) {
    if (i == 0) {
      data.objects.push({
        xtype: "SUN",
        position: this.getRadialPosition(x, y, i * step, 0)
      });
    } else {
      data.objects.push({
        xtype: "PLANET",
        ptype: 1,
        position: this.getRadialPosition(x, y, 200 + i * step, Math.random() * 360)
      });
    }
  }
  
  return data;
}

module.exports.prototype.buildMisstionsData = function(total, d) {
  var data = d ? d : {
    objects: [],
    missions: []
  };

  for (var i = 0;i < total;i ++) {
    data.missions.push({
      totalShips: 57,
      startTime: 100,
      travelTime: 100,
      source: {
        id: "SOURCE_ID",
        position: {
          x: 100,
          y: 100
        }
      },
      target: {
        id: "TARGET_ID",
        position: {
          x: 200,
          y: 200
        }
      }
    });
  }

  return data;
}

module.exports.prototype.test1 = function() {
  var data = this.buildSystemsData(6 + parseInt(Math.random() * 10));
  this.battleField.renderData(data);
}

module.exports.prototype.test2 = function() {
  var data = this.buildSystemsData(6 + parseInt(Math.random() * 10));
  data = this.buildMisstionsData(1 + parseInt(Math.random() * 3), data);

  this.battleField.renderData(data);
}

module.exports.prototype.test3 = function() {
  var data = this.buildMisstionsData(1 + parseInt(Math.random() * 3));
  this.battleField.renderData(data);
}

module.exports.prototype.test4 = function() {
  var data = this.buildSystemsData(6 + parseInt(Math.random() * 10));
  this.buildSystemsData(6 + parseInt(Math.random() * 10), data, -3100, -1500);
  this.buildSystemsData(6 + parseInt(Math.random() * 10), data, 3600, -500);
  this.buildSystemsData(6 + parseInt(Math.random() * 10), data, 2100, 1900);
  this.buildSystemsData(6 + parseInt(Math.random() * 10), data, -5100, 500);
  this.buildSystemsData(6 + parseInt(Math.random() * 10), data, 6100, 2900);


  this.battleField.renderData(data);
}