var IndividualBoard = require("./individual");
var TeamBoard = require("./team");

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click #individualBtn": "switchToIdividualBoard",
    "click #teamBtn": "switchToTeamBoard"
  },
  className: "leaderboard-content",
  initialize: function(options) {
    this.context = options.context;
  },
  render: function() {
    this.$el.html(this.template());
    this.switchToIdividualBoard();

    return this;
  },
  switchToIdividualBoard: function() {
    var idividualBoard = new IndividualBoard({context: this.context});

    $(".board-content").html("").append(idividualBoard.$el);
    idividualBoard.render();
  },
  switchToTeamBoard: function() {
    var teamBoard = new TeamBoard();

    $(".board-content").html("").append(teamBoard.$el);
    teamBoard.render();
  }
})