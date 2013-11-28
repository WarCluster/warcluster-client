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

module.exports.prototype.parseMessage = function(command) {
  try {
    var data = JSON.parse(command);
    console.log("###.parseMessage:", data);
  } catch(err) {
    console.log("###.InvalidData:", command);
    return false;
  }
  
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
        this.renderViewFn(data);
      break;
      case "state_change":
        this.renderViewFn(data);
      break;
      case "send_mission":
        this.context.missionsFactory.build(data.Mission);
      break;
      case "send_mission_failed":
        humane.error(data.Error, {image: "./images/adjutant.gif",timeout:4000, clickToClose: true});
      break;
    }
  }
}

module.exports.prototype.scopeOfView = function(position, resolution) {
  debugger;
  this.sockjs.send(JSON.stringify({"Command": "scope_of_view", "Position": position, "Resolution": [resolution.width || 1920, resolution.height || 1080]}));
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