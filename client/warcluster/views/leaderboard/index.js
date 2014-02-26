var individualRender = jadeCompile(require("./render/individual.jade"));
var teamRender = jadeCompile(require("./render/team.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click #individualBtn": "showIndividualLeaderboard",
    "click #teamBtn": "showTeamLeaderboard"
  },
  className: "leaderboard-content",
  initialize: function() {
  },
  render: function() {
    var self = this;

    this.$el.html(this.template());
    this.showIndividualLeaderboard();
    
    this.username = "username";
    this.twitterId = "twitterId";
    //TODO: remove the msg and use different socket url for the leaderboard
    var msg = {
      "Command": "login", 
      "Username": this.username, 
      "TwitterId": this.twitterId
    };
    var new_status = function(status) {
      // console.log(status);
    };
    var on_message = function(msg) {
      // console.log(msg);
    };
    var on_open = function() {
      console.log('Leaderboard on open');

      self.sockjs.send(JSON.stringify(msg));
    };
    // this.sockjs = new SockReconnect.SockReconnect("http://127.0.0.1:7000/universe", null, new_status, on_message, on_open);
    // this.sockjs.connect();
    return this;
  },
  showIndividualLeaderboard: function() {
    $("#team").remove();
    if ($("#individual").length === 0) {
      this.$el.append(individualRender());
    }
  },
  showTeamLeaderboard: function() {
    $("#individual").remove();
    if ($("#team").length === 0) {
      this.$el.append(teamRender());
    }
  }
})
