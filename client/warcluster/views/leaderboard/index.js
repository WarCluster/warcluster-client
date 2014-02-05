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
    this.$el.html(this.template());
    this.showIndividualLeaderboard();
    return this;
  },
  showIndividualLeaderboard: function() {
    $("#team").remove();
    if ($("#individual").length === 0) {
      this.$el.append(individualRender());
    }
  },
  showTeamLeaderboard: function() {
    $("#individual").remove();
    if ($("#team").length === 0) {
      this.$el.append(teamRender());
    }
  }
})
