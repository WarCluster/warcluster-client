module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .close-btn": "removeTutorial"
  },
  className: "tutorial-menu hide",
  initialize: function(context) {
    this.context = context.context;
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  showMenu: function() {
    $(".tutorial-menu").show();
  },
  removeTutorial: function(e) {
    e.preventDefault();
    $(".tutorial-menu").hide();
  }
})