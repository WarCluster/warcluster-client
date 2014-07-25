module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
  },
  initialize: function() {
  },
  render: function() {
    this.$el.html(this.template());
    this.fetchData(this.page);;

    return this;
  },
  fetchData: function() {
    $.ajax({
      url: self.config.ajaxUrl + "/teams/",
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
      }, success: this.renderData
    });
  },
  renderData: function(data) {
    for (var i = 0;i < 6;i ++) {
      var $element = this.$('[data-id="'+(i+1)+'"]')
      $element.find(".position").html((i + 1));

      if (data[i]) {
        $element.find(".team-race-color").css({"background": "rgb("+ parseInt(data[i].Color.R*255)+","+parseInt(data[i].Color.G*255) +","+parseInt(data[i].Color.B*255)+")"});
        $element.find(".team-race-color").html(data[i].Name);
        $element.find(".players-number").html(data[i].Players);
        $element.find(".planets-number").html(data[i].Planets);
      } 
    }
  }
})