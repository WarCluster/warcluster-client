var individualRender = jadeCompile(require("./render/individual.jade"));
var teamRender = jadeCompile(require("./render/team.jade"));

//TODO: need to refactor this whole view O_O There's a lot of copy-pasting, especially for the animations 

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click #individualBtn": "showIndividualLeaderboard",
    "click #teamBtn": "showTeamLeaderboard",
    "click .race-color": "showTeamLeaderboard",
    "click .previous-page": "goToPreviousPage",
    "click .next-page": "goToNextPage",
    "keypress #search-field": "searchPlayer"
  },
  className: "leaderboard-content",
  initialize: function() {
  },
  render: function(twitterUsername) {
    var self = this;

    this.currentPage = -1;
    this.cache = {};
    this.$el.html(this.template());
    this.leaderboardAjaxTimeout = -1;

    if (twitterUsername) {
      this.goToUsernamePage(twitterUsername);
    } 
    this.showIndividualLeaderboard();
    
    return this;
  },
  searchPlayer: function (e) {
    $("#search-field").autocomplete({
      source: function( request, response ) {
        $.ajax({
          url: self.config.searchAjaxUrl + "/?player=" + request.term,
          dataType: "json",
          success: function(data) {
            response( $.map(data, function(item){
              return {
                label: item.Username
              }
            }));
          }
        });
      },
      autoFocus: true,
      minLength: 3,
      //this is needed in order to get rid of the nasty message
      messages: {
        noResults: '',
        results: function() {
          return '';
        }
      },
      select: _.bind(function (event, ui) {
        this.goToUsernamePage(ui.item.label);
      }, this)
    });
  },
  showIndividualLeaderboard: function() {
    $("#team").remove();
    $("#teamBtn").parent().removeClass("active");
    $("#individualBtn").parent().addClass("active");
    if ($("#individual").length === 0){
      this.currentPage = 1;
      this.cache = {};
      this.$el.append(individualRender());
      this.connectIndividualLeaderboard();
    }
  },
  showTeamLeaderboard: function(){
    $("#individual").remove();
    $("#individualBtn").parent().removeClass("active");
    $("#teamBtn").parent().addClass("active");
    if ($("#team").length === 0) {
      this.cache = {};
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
          alert("Woops, we didn't have time to handle this error right. Sorry for the inconvinience! Why don't you refresh? :) ");
        },
        400: function() {
          //TODO:
          //bad request, maybe go to page 1?;
          console.log("Page Not Found - 400");
          alert("Woops, we didn't have time to handle this error right. Sorry for the inconvinience! Why don't you refresh? :) ");
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
          alert("There're not enough players. Page Not Found - 404");
        },
        400: function() {
          //TODO:
          //bad request, maybe go to page 1?;
          alert("Bad request. Page Not Found - 400");
        }
      },
      success: this.populateIndividual
    });
  },
  populateIndividual: function(data) {
    var _that = this,
         n = this.currentPage*10,
         dataLen = data.length;
    //create the position of the players based on the currentPage
    for(n = 10; n > 0; n--) {
      $("tbody tr:nth-child("+ n +") > .position").html(n);
    }

    if (jQuery.isEmptyObject(this.cache)) {
      for(var i = 0; i <= dataLen-1; i++) {
        //animate only when necessary
        this._setPlayerData($("tbody tr:nth-child(" + (i+1) + ")"), data[i]);
        }
    } 
    else {
      for(var i = 0; i < 10; i++) {
        if(i <= dataLen-1) {
          if(i <= this.cache.length-1) {
            if(this.cache[i].Username === data[i].Username && this.cache[i].Planets !== data[i].Planets) {
              var $current_element = $("tbody tr:nth-child(" + (i+1) + ") > .planets");
              _.bind(this.implodeAnimation, $current_element);
              this.implodeAnimation($current_element);

              $current_element.html(data[i].Planets);

              _.bind(this.explodeAnimation, $current_element);
              this.explodeAnimation($current_element);
            } 
            else if (this.cache[i].Username !== data[i].Username) {
              var $current_element = $("tbody tr:nth-child(" + (i+1) + ")");
              //asynchronous animations are slower than the iteration of the 'for' - that's why I need to bind the calls
              _.bind(this.implodeAnimation, $current_element);
              this.implodeAnimation($current_element);

              this._setPlayerData($current_element, data[i]);

              _.bind(this.explodeAnimation,$current_element);
              this.explodeAnimation($current_element);
            }
          }
          else {
            var $current_element = $("tbody tr:nth-child(" + (i+1) + ")");
            //asynchronous animations are slower than the iteration of the 'for' - that's why I need to bind the calls
            _.bind(this.implodeAnimation,$current_element);
            this.implodeAnimation($current_element);

            this._setPlayerData($current_element, data[i]);

            _.bind(this.explodeAnimation,$current_element);
            this.explodeAnimation($current_element);
          }
        } 
        else if (i > dataLen - 1) {
          this._setPlayerData($("tbody tr:nth-child(" + (i+1) + ")"));
        }
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
    if (jQuery.isEmptyObject(this.cache)) {
      for(var i=0;i<data.length;i++) {
        this._setTeamData($("tbody tr:nth-child(" + (i+1) + ")"), data);
      }
    } 
    else {
      for(var i=0;i<data.length;i++) {
       if (this.cache[i].Name === data[i].Name) {
        if (this.cache[i].Players !== data[i].Players) { 
          _that.iter = $("tbody tr:nth-child(" + (i+1) + ") > .players-number");

          _.bind(this.implodeAnimation,_that.iter);
          this.implodeAnimation(_that.iter);

          $("tbody tr:nth-child(" + (i+1) + ") > .players-number").html(data[i].Planets);


          _.bind(this.explodeAnimation,_that.iter);
          this.explodeAnimation(_that.iter);
        } 
        else if (this.cache[i].Planets !== data[i].Planets) {
          _that.iter = $("tbody tr:nth-child(" + (i+1) + ") > .planets-number");

          _.bind(this.implodeAnimation,_that.iter);
          this.implodeAnimation(_that.iter);

          $("tbody tr:nth-child(" + (i+1) + ") > .planets-number").html(data[i].Planets);


          _.bind(this.explodeAnimation,_that.iter);
          this.explodeAnimation(_that.iter);
        }
        
       }
       else if (this.cache[i].Name !== data[i].Name) {
        _that.iter = $("tbody tr:nth-child(" + (i+1) + ")");
        //asynchronous animations are slower than the iteration of the 'for' - that's why I need to bind the calls
        _.bind(this.implodeAnimation,_that.iter);
        this.implodeAnimation(_that.iter);

        this._setTeamData($("tbody tr:nth-child(" + (i+1) + ")"), data[i]);
        
        _.bind(this.explodeAnimation,_that.iter);
        this.explodeAnimation(_that.iter);
       }
      }
    }
    this.cache = data;
    this.leaderboardAjaxTimeout = setTimeout(function() {
      _.bind(_that.pollTeams,_that);
      _that.pollTeams();
    }, 2500);
  },
  goToNextPage: function() {
    this.currentPage += 1;
    this.connectIndividualLeaderboard();
  },
  goToPreviousPage: function() {
    this.currentPage = (this.currentPage<2)?this.currentPage:(this.currentPage-1);
    this.connectIndividualLeaderboard();
  },
  goToUsernamePage: function(username) {
    $.ajax({
      url: self.config.searchAjaxUrl + "/?player=" + username,
      dataType: 'json',
      context: this,
      success: function(data) {
        this.currentPage = data[0].Page;
        this.pollIndividual(this.currentPage);
      }
    });
  },
  //TODO: find a proper naming for the animation. Figure out a better UX animation
  implodeAnimation: function(element) {
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
    element.animate({deg: 0}, {
      duration: 300,
      step: function(now) {
        element.css({
          transform: "rotateX(" + now*1.5 + "deg)" 
        })
      }
    });
  },
  _setPlayerData: function(element, data) {
    if (data) {
      element.find(".twitter-username").html("<a href='https://twitter.com/"+data.Username+"' target='_blank'>@"+data.Username+"</a>");
      element.find(".race-color").css({"background": "rgb("+ parseInt(data.Team.R*255)+","+parseInt(data.Team.G*255) +","+parseInt(data.Team.B*255)+")"});
      element.find(".home-planet").html(data.HomePlanet);
      element.find(".planets").html(data.Planets);
    } else {
      element.find(".twitter-username").html("");
      element.find(".race-color").css({"background": "rgb(255,255,255)"});
      element.find(".home-planet").html("");
      element.find(".planets").html("");
    }
  },
  _setTeamData: function(element, data) {
    element.find(".twitter-username").html("<a href='https://twitter.com/"+data.Username+"' target='_blank'>@"+data.Username+"</a>");
    element.find(".race-color").css({"background": "rgb("+ parseInt(data.Team.R*255)+","+parseInt(data.Team.G*255) +","+parseInt(data.Team.B*255)+")"});
    element.find(".home-planet").html(data.HomePlanet);
    element.find(".planets").html(data.Planets);
  }
})
