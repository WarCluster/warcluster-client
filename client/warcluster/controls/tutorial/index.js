module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .close-btn": "removeTutorial"
  },
  className: "tutorial-menu",
  initialize: function(context) {
    this.context = context.context;
  },
  render: function() {
    this.$el.html(this.template());
    $(".ui-container").append(this.el);
    return this;
  },
  showMenu: function() {
    this.render();
  },
  removeTutorial: function(e) {
    e.preventDefault();
    this.remove();
  }
})