module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .close-btn": "removeTutorial"
  },
  className: "tutorialMenu hide",
  initialize: function(context) {
    this.context = context;
    $(".tutorialMenu").css({"top":this.context.windowCenterY,"left":this.context.windowCenterY});
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
    $(".tutorialMenu").hide();
  }
})