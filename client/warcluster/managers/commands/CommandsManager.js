var PlayerData = require("../../data/PlayerData");

module.exports = function(url, context){
  var self = this;
  this.url = url;
  this.context = context;

  this.loginFn = null;
  this.renderViewFn = null;
  this.connected = false;
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
  var new_status = function(status) {
    console.log(status);
    self.connected = status === 'connected';
  };
  var on_message = function(msg) {
    // console.log("on_message", JSON.parse(msg.data));
    self.parseMessage(msg.data);
  };
  var on_open = function() {
    console.log('open');

    self.sockjs.send(JSON.stringify(msg));
  }
  //TODO: figure out why I need to do SockReconnect.SockReconnect (double time instead of just ones)
  this.sockjs = new SockReconnect.SockReconnect(this.url, null, new_status, on_message, on_open);
  this.sockjs.connect();

}

module.exports.prototype.parseMessage = function(command) {
  var data = JSON.parse(command);
  //var data = JSON.parse(command);
  //console.log("###.parseMessage:", data);

  if (data.Command) {
    this.context.currentTime =  data.Timestamp;
    switch (data.Command) {
      case "login_success":
        var pd = new PlayerData();

        pd.Username = this.username;
        pd.TwitterID = this.twitterId;
        pd.Position = data.Position;
        pd.Race = data.RaceID;
        pd.HomePlanet = data.HomePlanet;
        this.loginFn(pd);
      break;
      case "scope_of_view_result":
        this.renderViewFn(data);
      break;
      case "state_change":
        this.renderViewFn(data);
      break;
      case "request_setup_params":
        this.requestSetupParameters();
      break;
      case "send_missions":
        for (key in data.Missions) {
          this.context.missionsFactory.build(data.Missions[key]);
        }
      break;
      case "send_mission_failed":
        var n = noty({text:"You're attacking with less than one pilot",type:"info"});
      break;
      case "server_params":
        this.context.serverParams = {
          HomeSPM: data.HomeSPM,
          PlanetsSPM: data.PlanetsSPM,
          Races: data.Races
        }
        break;
      case "owner_change":
        var self = this;
        for (key in data.Planet) {
          var n = noty({
              text   : "You've lost planet " + data.Planet[key].Name,
              type   : 'warning',
              planetCoordinates : data.Planet[key].Position,
              buttons: [
                  { addClass: 'btn btn-primary', text: 'View', 
                    onClick: _.bind(function($noty) {
                      $noty.close();
                      this.context.spaceViewController.scroller.scrollTo($noty.options.planetCoordinates.X, $noty.options.planetCoordinates.Y, true);
                    }, self)
                  }
              ]
          });
        }
      break;
      default:
        console.log(data);
    }
  }
}

module.exports.prototype.scopeOfView = function(position, resolution) {
  //https://trello.com/c/slSUdtQd/214-fine-tune-scope-of-view
  var data = {"Command": "scope_of_view", "Position": position, "Resolution": [resolution.width || 1920, resolution.height || 1080]}
  //console.log("scopeOfView", data)
  this.sockjs.send(JSON.stringify(data));
}

module.exports.prototype.sendMission = function(type, source, target, ships) {
  //console.log("sendMission:", type, source, target, ships)
  this.sockjs.send(JSON.stringify({
    "Command": "start_mission",
    "Type": type,
    "StartPlanets": source,
    "EndPlanet": target,
    "Fleet": ships
  }));
}

module.exports.prototype.setupParameters = function(race, sun) {
  this.sockjs.send(JSON.stringify({
    "Command": "setup_parameters",
    "Race": race,
    "SunTextureId": sun
  }))
}