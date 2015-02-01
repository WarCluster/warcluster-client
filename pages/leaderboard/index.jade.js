var boot = require("../../client/boot");
var LeaderboardView = require("../../client/warcluster/views/leaderboard")
// config = require("../../client/config");

$(document).ready(function() {

  //Google analytics
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-42427250-1', 'warcluster.com');
  ga('send', 'pageview');
  //end of google analytics

  var leaderboard = new LeaderboardView();
  $("body").html("").append(leaderboard.el)
  leaderboard.render();
});