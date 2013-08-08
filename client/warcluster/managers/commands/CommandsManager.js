var PlayerData = require("../../data/PlayerData");

module.exports = function(url, context){
  this.url = url;
  this.context = context;

  this.loginFn = null;
  this.updateViewFn = null;
}

module.exports.prototype.prepare = function(username, twitterId) {
  var self = this;

  this.username = username;
  this.twitterId = twitterId;

  var msg = {
    "Command": "login", 
    "Username": username, 
    "TwitterId": twitterId
  };
  
  this.sockjs = new SockJS(this.url);
  this.sockjs.onopen = function() {
    console.log('open');

    self.sockjs.send(JSON.stringify(msg));
  };
  
  this.sockjs.onmessage = function(e) {
    self.parseMessage(e.data);
  };

  this.sockjs.onclose = function() {
    console.log('close');
  };
}

// ***********************************************************************************
// ***********************************************************************************
// ***********************************************************************************

module.exports.prototype.parseMessage = function(command) {
  

  try {
    var data = JSON.parse(command);
  } catch(err) {
    console.log("###.InvalidData:", command);
    return false;
  }
  console.log("###.parseMessage:", data);
  if (data.Command) {
    switch (data.Command) {
      case "login_success":
        var pd = new PlayerData();
        pd.Username = this.username;
        pd.TwitterID = this.twitterId;
        pd.Position = data.Position;

        this.loginFn(pd);
      break;
      case "scope_of_view_result":
        var renderData = this.parseData(data);
        this.updateViewFn(renderData);
      break;
    }
  } else {
    for (var s in data) {
      var d = s.split(".")[1].split("_");
      var time = parseInt(d[0]) * 1000;
      var targetPosition = data[s].EndPlanet.split(".")[1].split("_");

      this.context.currentTime = time;
      
      var mission = {
        startTime: time,
        travelTime: 10000,
        source: {
          x: parseFloat(d[1]),
          y: parseFloat(d[2])
        },
        target: {
          x: parseFloat(targetPosition[0]),
          y: parseFloat(targetPosition[1])
        }
      };

      
      this.context.missionsFactory.build(mission);
    }
  }
}

module.exports.prototype.parseData = function(data) {
  var renderData = {
    objects: [],
    missions: []
  }
  
  var pos, item;
  var sc = 1;
  for (var s in data.Planets) {
    item = data.Planets[s];
    item.id = s;

    if (s.indexOf("planet") != -1) {
      pos = s.split("planet.").join("").split("_");
      renderData.objects.push({
        xtype: "PLANET",
        planetData: item,
        position: {
          x: pos[0] * sc,
          y: pos[1] * sc
        }
      });
    } else if (s.indexOf("sun") != -1) {
      pos = s.split("sun.").join("").split("_");
      renderData.objects.push({
        xtype: "SUN",
        data: item,
        position: {
          x: pos[0] * sc,
          y: pos[1] * sc
        }
      });
    }
  }

  return renderData;
}

module.exports.prototype.scopeOfView = function(position, resolution) {
  this.sockjs.send(JSON.stringify({"Command": "scope_of_view", "Position": position, "Resolution": resolution || [1920, 1080]}));
}

module.exports.prototype.sendMission = function(source, target, ships) {
  console.log("sendMission:", source, target, ships)
  this.sockjs.send(JSON.stringify({
    "Command": "start_mission",
    "StartPlanet": source,
    "EndPlanet": target,
    "Fleet": ships || 40
  }));
}



