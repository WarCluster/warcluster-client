module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .start-game": "startGame"
  },
  className: "container text-center",
  initialize: function(options) {
    this.twitter = options.twitter;
  },
  render: function() {
    this.$el.html(this.template({twitter: this.twitter}));
    this.$('.colorselector').colorselector();
    return this;
  },
  startGame: function() {
    router.navigate("battle-field", true)
  }
})
