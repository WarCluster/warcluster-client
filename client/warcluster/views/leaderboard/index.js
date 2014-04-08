var individualRender = jadeCompile(require("./render/individual.jade"));
var teamRender = jadeCompile(require("./render/team.jade"));

//TODO: need to refactor this ajax shit O_O

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click #individualBtn": "showIndividualLeaderboard",
    "click #teamBtn": "showTeamLeaderboard",
    "click .race-color": "showTeamLeaderboard"
  },
  className: "leaderboard-content",
  initialize: function() {
  },
  render: function() {
    var self = this;

    this.currentPage = 1;
    this.cache = {};
    this.$el.html(this.template());
    this.leaderboardAjaxTimeout = -1;
    this.showIndividualLeaderboard();
    
    this.username = "username";
    this.twitterId = "twitterId";

    return this;
  },
  showIndividualLeaderboard: function(){
    $("#team").remove();
    $("#teamBtn").parent().removeClass("active");
    $("#individualBtn").parent().addClass("active");
    if ($("#individual").length === 0){
      this.connectIndividualLeaderboard();
      this.$el.append(individualRender());
    }
  },
  showTeamLeaderboard: function(){
    $("#individual").remove();
    $("#individualBtn").parent().removeClass("active");
    $("#teamBtn").parent().addClass("active");
    if ($("#team").length === 0) {
      this.connectTeamLeaderboard();
      this.$el.append(teamRender());
    }
  },
  pollTeams: function() {
    $.ajax({});
  },
  pollIndividual: function(page) {
    $.ajax({
      url: self.config.ajaxUrl + "/players/?page=" + page, 
      dataType: 'json',
      context: this, 
      statusCode: {
        404: function () {
          //TODO:
          //not enough players, maybe go to page 1?;
          console.log("Page Not Found - 404");
          $("#individual").html("Woops, we didn't have time to handle this error right. Sorry for the inconvinience! Why don't you refresh? :) ");
        },
        400: function() {
          //TODO:
          //bad request, maybe go to page 1?;
          console.log("Page Not Found - 404");
          $("#individual").html("Woops, we didn't have time to handle this error right. Sorry for the inconvinience! Why don't you refresh? :) ");
        }
      },
      success: this.populateIndividual
    });
  },
  connectIndividualLeaderboard: function(){
    clearTimeout(this.leaderboardAjaxTimeout);
    this.pollIndividual(this.currentPage);
  },
  connectTeamLeaderboard: function(){
    clearTimeout(this.leaderboardAjaxTimeout);
    this.pollTeams();
  },
  populateIndividual: function(data) {
    var _that = this;
    for(i=0;i<data.length;i++) {
      //animate the shit out of it!
      $("tbody tr:nth-child(" + (i+1) + ") > .twitter-username").html("<a href='https://twitter.com/"+data[i].Username+"' target='_blank'>@"+data[i].Username+"</a>");
      $("tbody tr:nth-child(" + (i+1) + ") > .race-color").css({"background": "rgb("+ parseInt(data[i].Team.R*255)+","+parseInt(data[i].Team.G*255) +","+parseInt(data[i].Team.B*255)+")"});
      $("tbody tr:nth-child(" + (i+1) + ") > .home-planet").html(data[i].HomePlanet);
      $("tbody tr:nth-child(" + (i+1) + ") > .planets").html(data[i].Planets);
      // $("tbody tr:nth-child(" + 1 + ")").html("<td>1</td><td><a href='http://twitter.com/" + data[i].Username + "'>" + data[i].Username + "</td><td>" + data[i].Team + "</td><td>" + data[i].HomePlanet + "</td><td>" + data[i].Planets + "</td><td>");
      // if ($('#user-'+data[i].id).length == 0) {
      //   // this id doesn't exist, so add it to our list.
        // $("#leaderboard").append('<li><h1 style="display:inline" id="user-' + data[i].id + '">' + data[i].score + '</h1> <img style="height:50px" src="http://graph.facebook.com/' + data[i].facebook_id + '/picture"/> ' + data[i].username + '</li>');
      // } else {
      //   // this id does exist, so update 'score' count in the h1 tag in the list item.
      //   $('#user-'+data[i].id).html(data[i].score);
      // }
    }
    this.leaderboardAjaxTimeout = setTimeout(function() {
      _.bind(_that.pollIndividual,_that);
      _that.pollIndividual(_that.currentPage);
    }, 2500);
  }

})
