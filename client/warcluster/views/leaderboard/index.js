var individualRender = jadeCompile(require("./render/individual.jade"));
var teamRender = jadeCompile(require("./render/team.jade"));

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click #individualBtn": "showIndividualLeaderboard",
    "click #teamBtn": "showTeamLeaderboard"
  },
  className: "content",
  initialize: function(options) {
    
  },
  render: function() {
    this.$el.html(this.template({twitter: this.twitter}));
    this.$(".content").append(individualRender({model: planetData}));
    return this;
  },
  showIndividualLeaderboard: function() {
    this.$(".content").append(individualRender({model: planetData}));
  }
  showTeamLeaderboard: function() {
    this.$(".content").append(teamRender({model: planetData}));
  }
})
