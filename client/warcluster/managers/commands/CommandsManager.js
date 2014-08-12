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
  //var t1 = Date.now();
  var data = JSON.parse(command);
  //var t2 = Date.now();

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
        //console.log("###.parseMessage[state_change]:");
        this.renderViewFn(data);
      break;
      case "request_setup_params":
        this.requestSetupParameters();
      break;
      case "send_missions":
        //console.log("send_missions:", data)
        for (var i in data.Missions) {
          data.Missions[i].id = i;
          if (!this.context.objectsById[data.Missions[i].id])
            this.context.missionsFactory.build(data.Missions[i]);
        }
      break;
      case "send_mission_failed":
        //var n = noty({text:"You're attacking with less than one pilot",type:"info"});
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

  //console.log("###.parseMessage:", JSON.stringify(data, null, 2));
}

module.exports.prototype.scopeOfView = function(x, y, width, height) {
  //console.log("scopeOfView", x, y, width, height)
  this.sockjs.send('{' +
    '"Command": "scope_of_view",' +
    '"Position": {"x": '+x+', "y": '+y+'},' +
    '"Resolution": ['+width+', '+height+']' +
  '}');
}

module.exports.prototype.sendMission = function(type, source, target, ships) {
  //console.log("sendMission:", type, source, target, ships)
  this.sockjs.send('{' +
    '"Command": "start_mission",' +
    '"Type": "'+type+'",' +
    '"StartPlanets": ["'+source.join('","')+'"],' +
    '"EndPlanet": "'+target+'",' +
    '"Fleet": '+ ships +
  '}');
}

module.exports.prototype.setupParameters = function(race, sun) {
  this.sockjs.send('{' +
    '"Command": "setup_parameters",' +
    '"Race": '+race+',' +
    '"SunTextureId": '+ sun +
  '}')
}

module.exports.prototype.testShips = function() {

  var message = {
    "Command": "send_missions",
    "Timestamp": Date.now(),
    "Missions": {
      
    },
    "FailedMissions": {}
  } 

  for (var i = 0;i < 500; i++) {
    var id = "mission." + Math.random();

    var p1 = this.context.planetsHitObjects[parseInt( this.context.planetsHitObjects.length * Math.random() )].parent;
    var p2 = this.context.planetsHitObjects[parseInt( this.context.planetsHitObjects.length * Math.random() )].parent;

    while (p2 == p1)
      p2 = this.context.planetsHitObjects[parseInt( this.context.planetsHitObjects.length * Math.random() )].parent;

    message.Missions[id] = {
      "Color": {
        "R": 0.39215687,
        "G": 0.8980392,
        "B": 0.10196078
      },
      "Source": {
        "Name": "TOX6448",
        "Owner": "toxic_real",
        "Position": p1.data.Position
      },
      "Target": {
        "Name": "TOX6443",
        "Owner": "toxic_real",
        "Position": p2.data.Position
      },
      "Type": "Supply",
      "StartTime": Date.now(),
      "TravelTime": 15000 + 10000 * Math.random(),
      "Player": "toxic_real",
      "ShipCount": 100 + parseInt(Math.random() * 5000),
      "id": id
    }
  }
  this.parseMessage(JSON.stringify(message));
  //console.log("testShips", message)
}