var individualRender = jadeCompile(require("./render/individual.jade"));
var raceRender = jadeCompile(require("./render/race.jade"));

//TODO: need to refactor this whole view O_O

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click #individualBtn": "showIndividualLeaderboard",
    "click #raceBtn": "showRaceLeaderboard",
    "click .race-color": "showRaceLeaderboard",
    "click .previous-page": "goToPreviousPage",
    "click .next-page": "goToNextPage",
    "touchstart #individualBtn": "showIndividualLeaderboard",
    "touchstart #RaceBtn": "showRaceLeaderboard",
    "touchstart .race-color": "showRaceLeaderboard",
    "touchstart .previous-page": "goToPreviousPage",
    "touchstart .next-page": "goToNextPage",
    "keypress #search-field": "searchPlayer"
  },
  className: "leaderboard-content",
  initialize: function() {
  },
  render: function(twitterUsername) {
    var self = this;

    this.currentPage = -1;
    this.leaderboardDataCache = {};
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
      // messages: {
      //   noResults: '',
      //   results: function() {
      //     return '';
      //   }
      // },
      select: _.bind(function (event, ui) {
        this.goToUsernamePage(ui.item.label);
      }, this)
    });
  },
  showIndividualLeaderboard: function() {
    $("#race").remove();
    $("#raceBtn").parent().removeClass("active");
    $("#individualBtn").parent().addClass("active");
    if ($("#individual").length === 0){
      this.currentPage = 1;
      this.leaderboardDataCache = {};
      this.$el.append(individualRender());
      this._connectIndividualLeaderboard();
    }
  },
  showRaceLeaderboard: function(){
    $("#individual").remove();
    $("#individualBtn").parent().removeClass("active");
    $("#raceBtn").parent().addClass("active");
    if ($("#race").length === 0) {
      this.leaderboardDataCache = {};
      this._connectRaceLeaderboard();
      this.$el.append(raceRender());
    }
  },
  _connectIndividualLeaderboard: function(){
    clearTimeout(this.leaderboardAjaxTimeout);
    this._pollIndividual(this.currentPage);
  },
  _connectRaceLeaderboard: function(){
    clearTimeout(this.leaderboardAjaxTimeout);
    this._pollRaces();
  },
  _pollRaces: function() {
    $.ajax({
      url: self.config.ajaxUrl + "/races/",
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
      success: this._populateRaces
    });
  },
  _pollIndividual: function(page) {
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
      success: this._populateIndividual
    });
  },
  _populateIndividual: function(data) {
    var _that = this,
         j = this.currentPage*10,
         n,
         dataLen = data.length;
    //create the position of the players based on the currentPage
    for(n = 10; n > 0; n--, j--) {
      $("tbody tr:nth-child("+ n +") > .position").html(j);
    }

    if (jQuery.isEmptyObject(this.leaderboardDataCache)) {
      for(var i = 0; i <= dataLen-1; i++) {
        //animate only when necessary
        this._setPlayerData($("tbody tr:nth-child(" + (i+1) + ")"), data[i]);
        }
    }
    else {
      for(var i = 0; i < 10; i++) {
        if(i <= dataLen-1) {
          if(i <= this.leaderboardDataCache.length-1) {
            if(this.leaderboardDataCache[i].Username === data[i].Username && this.leaderboardDataCache[i].Planets !== data[i].Planets) {
              var $current_element = $("tbody tr:nth-child(" + (i+1) + ") .planets");

              _.bind(this._implodeAnimation, $current_element);
              this._implodeAnimation($current_element);

              $current_element.html(data[i].Planets);

              _.bind(this._explodeAnimation, $current_element);
              this._explodeAnimation($current_element);
            }
            else if (this.leaderboardDataCache[i].Username !== data[i].Username && this.leaderboardDataCache[i].Username) {
              var $current_element = $("tbody tr:nth-child(" + (i+1) + ")");
              //asynchronous animations are slower than the iteration of the 'for' - that's why I need to bind the calls
              _.bind(this._implodeAnimation, $current_element);
              this._implodeAnimation($current_element);

              this._setPlayerData($current_element, data[i]);

              _.bind(this._explodeAnimation,$current_element);
              this._explodeAnimation($current_element);
            }
          }
          else {
            this._setPlayerData($("tbody tr:nth-child(" + (i+1) + ")"), data[i]);
          }
        }
        else if (i > dataLen - 1) {
          this._setPlayerData($("tbody tr:nth-child(" + (i+1) + ")"));
        }
      }
    }
    this.leaderboardDataCache = data;
    if (this.leaderboardAjaxTimeout) {
      clearTimeout(this.leaderboardAjaxTimeout);
      this.leaderboardAjaxTimeout = null;
    }
    this.leaderboardAjaxTimeout = setTimeout(function() {
      _.bind(_that._pollIndividual,_that);
      _that._pollIndividual(_that.currentPage);
    }, 2500);
  },
  _populateRaces: function(data) {
    var _that = this;

    if (jQuery.isEmptyObject(this.leaderboardDataCache)) {
      for(var i=0; i < data.length; i++) {
        this._setRaceData($("tbody tr:nth-child(" + (i+1) + ")"), data[i]);
      }
    }
    else {
      for(var i=0; i < data.length; i++) {
        if (this.leaderboardDataCache[i] && this.leaderboardDataCache[i].Name && this.leaderboardDataCache[i].Name === data[i].Name) {
          if (this.leaderboardDataCache[i].Players && this.leaderboardDataCache[i].Players !== data[i].Players) {
            _that.iter = $("tbody tr:nth-child(" + (i+1) + ") .players-number");

            _.bind(this._implodeAnimation,_that.iter);
            this._implodeAnimation(_that.iter);

            $("tbody tr:nth-child(" + (i+1) + ") .players-number").html(data[i].Players);


            _.bind(this._explodeAnimation,_that.iter);
            this._explodeAnimation(_that.iter);
          }
          else if (this.leaderboardDataCache[i].Planets !== data[i].Planets) {
            _that.iter = $("tbody tr:nth-child(" + (i+1) + ") .planets-number");

            _.bind(this._implodeAnimation,_that.iter);
            this._implodeAnimation(_that.iter);

            $("tbody tr:nth-child(" + (i+1) + ") .planets-number").html(data[i].Planets);


            _.bind(this._explodeAnimation,_that.iter);
            this._explodeAnimation(_that.iter);
          }

        }
        else if (this.leaderboardDataCache[i] && this.leaderboardDataCache[i].Name && this.leaderboardDataCache[i].Name !== data[i].Name && data[i].Name) {
          _that.iter = $("tbody tr:nth-child(" + (i+1) + ")");
          //asynchronous animations are slower than the iteration of the 'for' - that's why I need to bind the calls
          _.bind(this._implodeAnimation,_that.iter);
          this._implodeAnimation(_that.iter);

          this._setRaceData($("tbody tr:nth-child(" + (i+1) + ")"), data[i]);

          _.bind(this._explodeAnimation,_that.iter);
          this._explodeAnimation(_that.iter);
        }
      }
    }
    this.leaderboardDataCache = data;
    if (this.leaderboardAjaxTimeout) {
      clearTimeout(this.leaderboardAjaxTimeout);
      this.leaderboardAjaxTimeout = null;
    }
    this.leaderboardAjaxTimeout = setTimeout(function() {
      _.bind(_that._pollRaces,_that);
      _that._pollRaces();
    }, 2500);
  },
  goToNextPage: function() {
    this.currentPage += 1;
    this._connectIndividualLeaderboard();
  },
  goToPreviousPage: function() {
    this.currentPage = (this.currentPage<2)?this.currentPage:(this.currentPage-1);
    this._connectIndividualLeaderboard();
  },
  goToUsernamePage: function(username) {
    $.ajax({
      url: self.config.searchAjaxUrl + "/?player=" + username,
      dataType: 'json',
      context: this,
      success: function(data) {
        this.currentPage = data[0].Page;
        this._pollIndividual(this.currentPage);
      }
    });
  },
  //TODO: find a proper naming for the animation. Figure out a better UX animation
  _implodeAnimation: function(element) {
    element.animate({deg: 60}, {
      duration: 200,
      step: function(now) {
        element.css({
          transform: "rotateX(" + now*1.5 + "deg)"
        })
      }
    });
  },
  _explodeAnimation: function(element) {
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

    //TODO: https://trello.com/c/CZbrIQfl/404-add-races-color-in-leaderboard-responses
    //when they're ready with this card we should remove this hardcoded switch
    // console.log(data);
    if (data !== undefined) {
      switch (data.RaceId) {
        case 0:
          data.Race = {
            R: 228,
            G: 8,
            B: 14
          }
        break;
        case 1:
          data.Race = {
            R: 244,
            G: 75,
            B: 15
          }
        break;
        case 2:
          data.Race = {
            R: 254,
            G: 203,
            B: 4
          }
        break;
        case 3:
          data.Race = {
            R: 100,
            G: 229,
            B: 26
          }
        break;
        case 4:
          data.Race = {
            R: 0,
            G: 208,
            B: 255
          }
        break;
        case 5:
          data.Race = {
            R: 255,
            G: 0,
            B: 200
          }
        break;
      }
    }
    if (data) {
      element.find(".twitter-username").html("<a href='https://twitter.com/"+data.Username+"' target='_blank'>@"+data.Username+"</a>");
      element.find(".race-color").css({"background": "rgb("+ parseInt(data.Race.R)+","+parseInt(data.Race.G) +","+parseInt(data.Race.B)+")"});
      element.find(".home-planet").html(data.HomePlanet);
      element.find(".planets").html(data.Planets);
    } else {
      element.find(".twitter-username").html("");
      element.find(".race-color").css({"background": "rgb(33,33,33)"});
      element.find(".home-planet").html("");
      element.find(".planets").html("");
    }
  },
  _setRaceData: function(element, data) {
    //TODO: https://trello.com/c/CZbrIQfl/404-add-races-color-in-leaderboard-responses
    //when they're ready with this card we should remove this hardcoded switch
    switch (data.Id) {
        case 0:
          data.Color = {
            R: 228,
            G: 8,
            B: 14
          }
        break;
        case 1:
          data.Color = {
            R: 244,
            G: 75,
            B: 15
          }
        break;
        case 2:
          data.Color = {
            R: 254,
            G: 203,
            B: 4
          }
        break;
        case 3:
          data.Color = {
            R: 100,
            G: 229,
            B: 26
          }
        break;
        case 4:
          data.Color = {
            R: 0,
            G: 208,
            B: 255
          }
        break;
        case 5:
          data.Color = {
            R: 255,
            G: 0,
            B: 200
          }
        break;
      }
    element.find(".race-race-color").css({"background": "rgb("+ parseInt(data.Color.R)+","+parseInt(data.Color.G) +","+parseInt(data.Color.B)+")"});
    element.find(".race-race-color").html(data.Name);
    element.find(".players-number").html(data.Players);
    element.find(".planets-number").html(data.Planets);
  }
})
