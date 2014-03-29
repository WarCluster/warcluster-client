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

    return this;
  },
  showIndividualLeaderboard: function(){
    $("#team").remove();
    if ($("#individual").length === 0){
      this.connectIndividualLeaderboard();
      this.$el.append(individualRender());
    }
  },
  showTeamLeaderboard: function(){
    $("#individual").remove();
    if ($("#team").length === 0) {
      this.connectTeamLeaderboard();
      this.$el.append(teamRender());
    }
  },
  connectIndividualLeaderboard: function(){
    // clearTimeout(self.t);
    $.ajax({
        url: self.config.ajaxUrl + "/players/?page=1", 
        dataType: 'json',
        statusCode: {
          404: function () {
            //TODO:
            //not enough players, maybe go to page 1?;
          },
          400: function() {
            //TODO:
            //bad request, maybe go to page 1?;
          }
        },
        success: function(data) {
          debugger;
          for(i=0;i<data.length;i++) {
            $("tbody tr:nth-child(" + 1 + ")").html("<td>1</td><td><a href='http://twitter.com/" + data[i].Username + "'>" + data[i].Username + "</td><td>" + data[i].Team + "</td><td>" + data[i].HomePlanet + "</td><td>" + data[i].Planets + "</td><td>");
            // if ($('#user-'+data[i].id).length == 0) {
            //   // this id doesn't exist, so add it to our list.
            //   $("#leaderboard").append('<li><h1 style="display:inline" id="user-' + data[i].id + '">' + data[i].score + '</h1> <img style="height:50px" src="http://graph.facebook.com/' + data[i].facebook_id + '/picture"/> ' + data[i].username + '</li>');
            // } else {
            //   // this id does exist, so update 'score' count in the h1 tag in the list item.
            //   $('#user-'+data[i].id).html(data[i].score);
            // }
          }
          // sort();
        },
      }); 
    // function poll() {
    //   $.ajax({
    //     url: self.config.ajaxUrl, // needs to return a JSON array of items having the following properties: id, score, facebook_id, username
    //     dataType: 'json',
    //     success: function(o) {
    //       debugger;
    //       for(i=0;i<o.length;i++) {
    //         if ($('#user-'+o[i].id).length == 0) {
    //           // this id doesn't exist, so add it to our list.
    //           $("#leaderboard").append('<li><h1 style="display:inline" id="user-' + o[i].id + '">' + o[i].score + '</h1> <img style="height:50px" src="http://graph.facebook.com/' + o[i].facebook_id + '/picture"/> ' + o[i].username + '</li>');
    //         } else {
    //           // this id does exist, so update 'score' count in the h1 tag in the list item.
    //           $('#user-'+o[i].id).html(o[i].score);
    //         }
    //       }
    //       sort();
    //     },
    //   }); 
    // poll();
    // // play it again, sam
    // self.t=setTimeout("poll()",3000);
    // }
  },
  connectTeamLeaderboard: function(){
    // clearTimeout(self.t);
    // function poll() {
    //   $.ajax({
    //     url: self.config.ajaxUrl, // needs to return a JSON array of items having the following properties: id, score, facebook_id, username
    //     dataType: 'json',
    //     success: function(o) {
    //       for(i=0;i<o.length;i++) {
    //         if ($('#user-'+o[i].id).length == 0) {
    //           // this id doesn't exist, so add it to our list.
    //           $("#leaderboard").append('<li><h1 style="display:inline" id="user-' + o[i].id + '">' + o[i].score + '</h1> <img style="height:50px" src="http://graph.facebook.com/' + o[i].facebook_id + '/picture"/> ' + o[i].username + '</li>');
    //         } else {
    //           // this id does exist, so update 'score' count in the h1 tag in the list item.
    //           $('#user-'+o[i].id).html(o[i].score);
    //         }
    //       }
    //       sort();
    //     },
    //   }); 

    //   // play it again, sam
    //   self.t=setTimeout("poll()",3000);
    // }
  }
})
