module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .close-btn": "removeTutorial"
  },
  className: "tutorialMenu hide",
  initialize: function() {
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  showMenu: function() {
    $(".tutorialMenu").show();
  },
  removeTutorial: function(e) {
    e.preventDefault();
    this.hide();
  }
})