//TODO: need to refactor the whole leaderboard iframe process
SockReconnect = require("../../client/vendor/SockReconnect.min");
var Leaderboard = require("../../client/warcluster/views/leaderboard")
// config = require("../../client/config");

$(document).ready(function() {
  var self = this;

  //Google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-42427250-1', 'warcluster.com');
  ga('send', 'pageview');
  //end of google analytics

  var msg = {
    "Command": "login", 
    "Username": "username", 
    "TwitterId": "twitterId"
  };
  var new_status = function(status) {
    console.log(status);
  };
  var on_message = function(msg) {
    // self.parseMessage(msg.data);
    // console.log(msg);
  };
  var on_open = function() {
    console.log('open');

    self.sockjs.send(JSON.stringify(msg));
  }
  //TODO: figure out why I need to do SockReconnect.SockReconnect (double time instead of just ones)
  this.sockjs = new SockReconnect.SockReconnect("http://127.0.0.1:7000/universe", null, new_status, on_message, on_open);
  this.sockjs.connect();
});

showIndividualLeaderboard = function(e){
  $("#individual").show();
  $("#team").hide();
  $("#teamBtn").parent().removeClass("active");
  $("#individualBtn").parent().addClass("active");
}
showTeamLeaderboard = function(e){
  $("#individual").hide();
  $("#team").show();
  $("#individualBtn").parent().removeClass("active");
  $("#teamBtn").parent().addClass("active");
}

renderLeaderboard = function(e) {

}