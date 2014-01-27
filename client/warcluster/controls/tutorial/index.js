module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .close-btn":   "toggleTutorial",
    "click .toggle-btn":  "toggleTutorial"
  },
  className: "tutorial-menu",
  initialize: function(context) {
    // this.context = context.context;
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  toggleTutorial: function() {
    if (this.expanded()) {
      this.$(".tutorial-content").removeClass("hide");
    } else {
      this.$(".tutorial-content").addClass("hide");
    }
  },
  expanded: function() {
    return this.$(".tutorial-content").hasClass("hide");
  }
})