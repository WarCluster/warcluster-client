module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .close-btn":   "toggleTutorial",
    "click .toggle-btn":  "toggleTutorial"
  },
  className: "tutorial-menu",
  initialize: function() {
  },
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  toggleTutorial: function() {
    if (this.expanded()) {
      $(".tutorial-content").removeClass("hide");
      TweenLite.to($(".tutorial-image"), 0.2, {
        css:  { width: "882px",
                height: "574px",
                top: "0",
                left: "0"
                },
        ease: Cubic.easeOut,
        onComplete: function() {
        }
      });
    } else {
      TweenLite.to($(".tutorial-image"), 0.3, {
        css:  { width: "50px",
                height: "50px",
                top: "",
                left: ""
                },
        ease: Cubic.easeOut,
        onComplete: function() {
          $(".tutorial-content").addClass("hide");
        }
      });
    }
  },
  expanded: function() {
    return this.$(".tutorial-content").hasClass("hide");
  }
})