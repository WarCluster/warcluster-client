module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .previous-page": "previousPage",
    "click .next-page": "nextPage",
    "keypress #search-field": "searchPlayer"
  },
  initialize: function(options) {
    this.context = options.context;

    this.page = 1;
    this.requestedPage = 1;
  },
  render: function() {
    this.$el.html(this.template());

    this.goToUsernamePage();
    return this;
  },
  previousPage: function() {
    if (this.page != 1) {
      this.requestedPage --;
      this.fetchData();
    }
  },
  nextPage: function() {
    this.requestedPage ++;
    this.fetchData();
  },
  searchPlayer: function (e) {
    this.reset();

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
  goToUsernamePage: function() {
    this.reset();

    $.ajax({
      url: self.config.searchAjaxUrl + "/?player=" + this.context.playerData.Username,
      dataType: 'json',
      context: this,
      success: function(data) {
        this.page = data[0].Page;
        this.requestedPage = data[0].Page;
        this.fetchData();
      }
    });
  },
  fetchData: function() {
    this.reset();

    $.ajax({
      url: config.ajaxUrl + "/players/?page=" + this.requestedPage,
      dataType: 'json',
      context: this,
      statusCode: {
        404: function () {
          //TODO:
          //not enough players, maybe go to page 1?;
          self.requestedPage = self.page;
          alert("There're not enough players. Page Not Found - 404");
        },
        400: function() {
          //TODO:
          //bad request, maybe go to page 1?;
          alert("Bad request. Page Not Found - 400");
          self.requestedPage = self.page;
        }
      }, success: this.renderData
    });
  },
  renderData: function(data) {
    console.log("-renderData-")
    var self = this;

    this.page = this.requestedPage;
    this.timeout = setTimeout(function() {
      self.fetchData();
    }, 2500);

    for (var i = 0;i < 10;i ++) {
      var $element = this.$('[data-id="'+(i+1)+'"]')
      $element.find(".position").html((this.page - 1) * 10 + (i + 1));

      if (data[i]) {
        $element.find(".twitter-username").html("<a href='https://twitter.com/"+data[i].Username+"' target='_blank'>@"+data[i].Username+"</a>");
        $element.find(".race-color").css({"background": "rgb("+ parseInt(data[i].Team.R*255)+","+parseInt(data[i].Team.G*255) +","+parseInt(data[i].Team.B*255)+")"});
        $element.find(".home-planet").html(data[i].HomePlanet);
        $element.find(".planets").html(data[i].Planets);
      } else {
        $element.find(".twitter-username").html("");
        $element.find(".race-color").css({"background": "rgb(33,33,33)"});
        $element.find(".home-planet").html("");
        $element.find(".planets").html("");
      }
    }
  },
  reset: function() {
    if (this.timeout)
      clearTimeout(this.timeout);
  }
})