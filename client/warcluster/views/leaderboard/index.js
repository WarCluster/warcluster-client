var individualRender = jadeCompile(require("./render/individual.jade"));
var teamRender = jadeCompile(require("./render/team.jade"));

//TODO: need to refactor this whole view with the ajax shit O_O

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click #individualBtn": "showIndividualLeaderboard",
    "click #teamBtn": "showTeamLeaderboard",
    "click .race-color": "showTeamLeaderboard",
    //TODO: implement the pagination this way?
    // use goToPage
    "click .previous-page": "goToPreviousPage",
    "click .next-page": "goToNextPage"
  },
  className: "leaderboard-content",
  initialize: function(twitterUsername) {
    if (twitterUsername) {
      this.username =  twitterUsername || "username";
      //TODO: implement the focus on the player
      //goToPageUsernamePage(this.username);
    }
  },
  render: function() {
    var self = this;

    this.currentPage = 1;
    this.cache = {};
    this.$el.html(this.template());
    this.leaderboardAjaxTimeout = -1;
    this.showIndividualLeaderboard();

    return this;
  },
  showIndividualLeaderboard: function(){
    $("#team").remove();
    $("#teamBtn").parent().removeClass("active");
    $("#individualBtn").parent().addClass("active");
    if ($("#individual").length === 0){
      //TODO: refactor the flow
      //1. goToPage 
      //2. then connectIndividualLeaderboard
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
  connectIndividualLeaderboard: function(){
    clearTimeout(this.leaderboardAjaxTimeout);
    this.pollIndividual(this.currentPage);
  },
  connectTeamLeaderboard: function(){
    clearTimeout(this.leaderboardAjaxTimeout);
    this.pollTeams();
  },
  pollTeams: function() {
    $.ajax({
      url: self.config.ajaxUrl + "/teams/",
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
          console.log("Page Not Found - 400");
          $("#individual").html("Woops, we didn't have time to handle this error right. Sorry for the inconvinience! Why don't you refresh? :) ");
        }
      },
      success: this.populateTeams
    });
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
          console.log("Page Not Found - 400");
          $("#individual").html("Woops, we didn't have time to handle this error right. Sorry for the inconvinience! Why don't you refresh? :) ");
        }
      },
      success: this.populateIndividual
    });
  },
  populateIndividual: function(data) {
    var _that = this;

    for(var i=0;i<=data.length-1;i++) {
      //animate only when necessary
      if (jQuery.isEmptyObject(this.cache)) {
        $("tbody tr:nth-child(" + (i+1) + ") > .twitter-username").html("<a href='https://twitter.com/"+data[i].Username+"' target='_blank'>@"+data[i].Username+"</a>");
        $("tbody tr:nth-child(" + (i+1) + ") > .race-color").css({"background": "rgb("+ parseInt(data[i].Team.R*255)+","+parseInt(data[i].Team.G*255) +","+parseInt(data[i].Team.B*255)+")"});
        $("tbody tr:nth-child(" + (i+1) + ") > .home-planet").html(data[i].HomePlanet);
        $("tbody tr:nth-child(" + (i+1) + ") > .planets").html(data[i].Planets);
      } 
      else if (this.cache[i].Username === data[i].Username && this.chache[i].Planets !== data[i].Planets) {
        //TODO: Shake it dat ass 
        $("tbody tr:nth-child(" + (i+1) + ") > .planets").html(data[i].Planets);
      } 
      else {
        _that.iter = $("tbody tr:nth-child(" + (i+1) + ")");
        //asynchronous animations are slower than the iteration of the 'for' - that's why I need to bind the calls
        _.bind(this.implodeAnimation,_that.iter);
        this.implodeAnimation(_that.iter);

        $("tbody tr:nth-child(" + (i+1) + ") > .twitter-username").html("<a href='https://twitter.com/"+data[i].Username+"' target='_blank'>@"+data[i].Username+"</a>");
        $("tbody tr:nth-child(" + (i+1) + ") > .race-color").css({"background": "rgb("+ parseInt(data[i].Team.R*255)+","+parseInt(data[i].Team.G*255) +","+parseInt(data[i].Team.B*255)+")"});
        $("tbody tr:nth-child(" + (i+1) + ") > .home-planet").html(data[i].HomePlanet);
        $("tbody tr:nth-child(" + (i+1) + ") > .planets").html(data[i].Planets);
        
        _.bind(this.explodeAnimation,_that.iter);
        this.explodeAnimation(_that.iter);
      }
    }
    this.cache = data;
    this.leaderboardAjaxTimeout = setTimeout(function() {
      _.bind(_that.pollIndividual,_that);
      _that.pollIndividual(_that.currentPage);
    }, 2500);
  },
  populateTeams: function(data) {
    var _that = this;
    for(var i=0;i<data.length;i++) {
      if (jQuery.isEmptyObject(this.cache)) {
        $("tbody tr:nth-child(" + (i+1) + ") > .race-color").css({"background": "rgb("+ parseInt(data[i].Color.R*255)+","+parseInt(data[i].Color.G*255) +","+parseInt(data[i].Color.B*255)+")"});
        $("tbody tr:nth-child(" + (i+1) + ") > .race-color").html(data[i].Name);
        $("tbody tr:nth-child(" + (i+1) + ") > .players-number").html(data[i].Players);
        $("tbody tr:nth-child(" + (i+1) + ") > .planets-number").html(data[i].Planets);
      }
      else if (this.cache[i].Name === data[i].Name && (this.cache[i].Players !== data[i].Players || this.cache[i].Planets !== data[i].Planets)) {
        //TODO: Shake it dat ass 
        $("tbody tr:nth-child(" + (i+1) + ") > .planets").html(data[i].Planets);
      }
      else {
        _that.iter = $("tbody tr:nth-child(" + (i+1) + ")");
        //asynchronous animations are slower than the iteration of the 'for' - that's why I need to bind the calls
        _.bind(this.implodeAnimation,_that.iter);
        this.implodeAnimation(_that.iter);

        $("tbody tr:nth-child(" + (i+1) + ") > .twitter-username").html("<a href='https://twitter.com/"+data[i].Username+"' target='_blank'>@"+data[i].Username+"</a>");
        $("tbody tr:nth-child(" + (i+1) + ") > .race-color").css({"background": "rgb("+ parseInt(data[i].Team.R*255)+","+parseInt(data[i].Team.G*255) +","+parseInt(data[i].Team.B*255)+")"});
        $("tbody tr:nth-child(" + (i+1) + ") > .home-planet").html(data[i].HomePlanet);
        $("tbody tr:nth-child(" + (i+1) + ") > .planets").html(data[i].Planets);
        
        _.bind(this.explodeAnimation,_that.iter);
        this.explodeAnimation(_that.iter);
      }
    }
    this.cache = data;
    this.leaderboardAjaxTimeout = setTimeout(function() {
      _.bind(_that.pollTeams,_that);
      _that.pollTeams();
    }, 2500);
  },
  //TODO: find a proper naming for the animation. Figure out a better UX animation
  implodeAnimation: function(element) {
    debugger;
    console.log(element);
    element.animate({deg: 60}, {
      duration: 200,
      step: function(now) {
        element.css({
          transform: "rotateX(" + now*1.5 + "deg)" 
        })
      }
    });
  },
  explodeAnimation: function(element) {
    console.log(element);
    element.animate({deg: 0}, {
      duration: 300,
      step: function(now) {
        element.css({
          transform: "rotateX(" + now*1.5 + "deg)" 
        })
      }
    });
  }
})
