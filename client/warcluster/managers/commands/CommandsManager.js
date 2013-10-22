var PlayerData = require("../../data/PlayerData");

module.exports = function(url, context){
  this.url = url;
  this.context = context;

  this.loginFn = null;
  this.renderViewFn = null;

  this.renderData = {
    suns: [],
    planets: [],
    missions: []
  }
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
    this.context.currentTime =  data.Timestamp;
    switch (data.Command) {
      case "login_success":
        var pd = new PlayerData();
        pd.Username = this.username;
        pd.TwitterID = this.twitterId;
        pd.Position = data.Position;

        this.loginFn(pd);
      break;
      case "scope_of_view_result":
        this.renderViewFn(this.prepareData(data));
      break;
      case "state_change":
        this.renderViewFn(this.prepareData(data));
      break;
      case "send_mission":
        this.context.missionsFactory.build(data.Mission);
        break;
    }
  } else {
      debugger;
    }
  
}

module.exports.prototype.prepareData = function(data) {
  this.renderData.suns = [];
  this.renderData.planets = [];
  this.renderData.missions = [];
  
  var pos, item;
  var sc = 1;

  for (var s in data.Planets) {
    item = data.Planets[s];
    item.id = s;

    pos = s.split("planet.").join("").split("_");

    item.x = pos[0];
    item.y = pos[1];

    this.renderData.planets.push(item);
  }

  for (s in data.Suns) {    
    item = data.Suns[s];
    item.id = s;
    pos = s.split("sun.").join("").split("_");

    item.x = pos[0];
    item.y = pos[1];

    this.renderData.suns.push(item);
  }

  for (s in data.Missions) {
    item = data.Missions[s];
    item.id = s;
    this.renderData.missions.push(item);
  }

  return this.renderData;
}

module.exports.prototype.scopeOfView = function(position, resolution) {
  this.sockjs.send(JSON.stringify({"Command": "scope_of_view", "Position": position, "Resolution": resolution || [1920, 1080]}));
}

module.exports.prototype.sendMission = function(type, source, target, ships) {
  console.log("sendMission:", type, source, target, ships)
  this.sockjs.send(JSON.stringify({
    "Command": "start_mission",
    "Type": type,
    "StartPlanet": source,
    "EndPlanet": target,
    "Fleet": ships
  }));
}



