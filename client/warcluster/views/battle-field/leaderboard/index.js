var Leaderboard = require("../../leaderboard")

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  info: jadeCompile(require("../../landing/info/index.jade")),
  className: "ingame-wrapper",
  events: {
    "click .loginBtn": "close"
  },
  initialize: function(options) {
    this.context = options.context;
  },
  render: function() {
    this.$el.html(this.template());
    this.leaderboard = new Leaderboard({context: this.context});
    this.$(".leaderboard-wrapper").append(this.leaderboard.el);
    this.leaderboard.render();
    
    this.$(".info-wrapper").append($(this.info({name: this.context.playerData.twitter.screen_name})))

    return this;
  },
  close: function() {
    this.$el.remove();
    this.leaderboard.reset();
  }
})